const Document = require("../models/Document");
const SharedDocument = require("../models/SharedDocument");
const documentService = require("../services/documentService");
const imageService = require("../services/imageService");

class DocumentController {
  // GET /api/documents
  async getUserDocuments(req, res) {
    try {
      const userId = req.user.id;

      // Buscar documentos do usuário
      const ownedDocuments = await Document.find({ ownerId: userId })
        .sort({ updatedAt: -1 })
        .select("-content");

      // Buscar documentos compartilhados com o usuário
      const sharedWithUser = await SharedDocument.find({
        sharedWithId: userId,
      }).populate({
        path: "documentId",
        select: "-content",
      });

      // Formatar documentos compartilhados
      const sharedDocuments = sharedWithUser.map((shared) => {
        const doc = shared.documentId;
        return {
          ...doc.toObject(),
          permissions: shared.permissions,
          sharedBy: shared.ownerId,
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          owned: ownedDocuments,
          shared: sharedDocuments,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar documentos",
      });
    }
  }

  // POST /api/documents
  async createDocument(req, res) {
    try {
      console.log("Criando novo documento...");
      console.log("Dados recebidos:", req.body);

      const { title, content, type } = req.body;
      const ownerId = req.user.id;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "O título é obrigatório",
        });
      }

      // Criar novo documento
      const newDocument = new Document({
        title,
        content: content || {},
        type: type || "text",
        ownerId,
        isShared: false,
        collaborators: [],
        lastEditedBy: ownerId,
      });

      // Salvar no banco
      const savedDocument = await newDocument.save();
      
      // Convert to plain object and ensure _id is accessible as id
      const docToReturn = savedDocument.toObject();
      docToReturn.id = docToReturn._id;

      console.log("Documento criado com sucesso:", docToReturn);

      return res.status(201).json({
        success: true,
        data: docToReturn,
      });
    } catch (error) {
      console.error("Erro ao criar documento:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao criar documento",
      });
    }
  }

  // GET /api/documents/:id
  async getDocument(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Buscar documento
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Documento não encontrado",
        });
      }

      // Verificar permissões
      const isOwner = document.ownerId.toString() === userId;
      const isCollaborator = document.collaborators.some(
        (collaborator) => collaborator.toString() === userId
      );

      if (!isOwner && !isCollaborator && !document.isShared) {
        // Se não for owner nem colaborador, verificar se tem compartilhamento específico
        const sharedWith = await SharedDocument.findOne({
          documentId: id,
          sharedWithId: userId,
        });

        if (!sharedWith) {
          return res.status(403).json({
            success: false,
            message: "Você não tem permissão para acessar este documento",
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error("Erro ao buscar documento:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar documento",
      });
    }
  }

  // PUT /api/documents/:id
  async updateDocument(req, res) {
    try {
      console.log("Atualizando documento...");

      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Buscar documento
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Documento não encontrado",
        });
      }

      // Verificar permissões de escrita
      const isOwner = document.ownerId.toString() === userId;
      const isCollaborator = document.collaborators.some(
        (collaborator) => collaborator.toString() === userId
      );

      let hasWritePermission = isOwner || isCollaborator;

      if (!hasWritePermission) {
        // Verificar permissões específicas
        const sharedWith = await SharedDocument.findOne({
          documentId: id,
          sharedWithId: userId,
        });

        hasWritePermission =
          sharedWith &&
          (sharedWith.permissions === "write" ||
            sharedWith.permissions === "admin");
      }

      if (!hasWritePermission) {
        return res.status(403).json({
          success: false,
          message: "Você não tem permissão para editar este documento",
        });
      }

      // Atualizar documento
      updates.lastEditedBy = userId;

      const updatedDocument = await Document.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      );

      // Emitir evento via socket (implementado no front-end ou via service)
      await documentService.notifyDocumentChange(id, updates, userId);

      return res.status(200).json({
        success: true,
        data: updatedDocument,
      });
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar documento",
      });
    }
  }
  // DELETE /api/documents/:id
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Buscar documento
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Documento não encontrado",
        });
      }

      // Verificar se é owner
      const isOwner = document.ownerId.toString() === userId;

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Somente o proprietário pode excluir o documento",
        });
      }

      // Deletar compartilhamentos
      await SharedDocument.deleteMany({ documentId: id });

      // Deletar documento
      await Document.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Documento excluído com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao excluir documento",
      });
    }
  }
  // POST /api/documents/:id/images
  async uploadImage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verificar se o documento existe
      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Documento não encontrado",
        });
      }

      // Verificar permissões
      const isOwner = document.ownerId.toString() === userId;
      const isCollaborator = document.collaborators.some(
        (collaborator) => collaborator.toString() === userId
      );

      let hasWritePermission = isOwner || isCollaborator;

      if (!hasWritePermission) {
        // Verificar permissões específicas
        const sharedWith = await SharedDocument.findOne({
          documentId: id,
          sharedWithId: userId,
        });

        hasWritePermission =
          sharedWith &&
          (sharedWith.permissions === "write" ||
            sharedWith.permissions === "admin");
      }

      if (!hasWritePermission) {
        return res.status(403).json({
          success: false,
          message:
            "Você não tem permissão para adicionar imagens a este documento",
        });
      }

      // O middleware de upload deve ter processado o arquivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nenhuma imagem enviada",
        });
      }

      // Usar o serviço de imagem para upload no Cloudinary
      const imageUrl = await imageService.uploadImage(req.file.path);

      // Adicionar URL ao array de imagens do documento
      document.images = document.images || [];
      document.images.push(imageUrl);
      document.lastEditedBy = userId;

      await document.save();

      return res.status(200).json({
        success: true,
        imageUrl: imageUrl,
        message: "Imagem adicionada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload de imagem:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao fazer upload de imagem",
      });
    }
  }
}

module.exports = DocumentController;
