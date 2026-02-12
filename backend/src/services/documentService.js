const Document = require("../models/Document");
const SharedDocument = require("../models/SharedDocument");

// Referência à instância do Socket.IO
let io = null;

/**
 * Serviço para operações relacionadas a documentos
 */
class DocumentService {
  /**
   * Configura a instância do Socket.IO para uso no serviço
   * @param {Object} socketIO - Instância do Socket.IO
   */
  setSocketIO(socketIO) {
    io = socketIO;
  }
  /**
   * Notifica clientes sobre alterações em um documento através do Socket.io
   * @param {String} documentId - ID do documento alterado
   * @param {Object} changes - Alterações feitas no documento
   * @param {String} userId - ID do usuário que fez as alterações
   */
  async notifyDocumentChange(documentId, changes, userId) {
    if (!io) {
      console.warn("Socket.IO não está configurado no DocumentService");
      return;
    }

    try {
      // Emitir evento para todos os clientes na sala do documento
      io.to(documentId).emit("document-change", {
        changes,
        userId,
        timestamp: new Date(),
      });

      // Opcionalmente, registrar a alteração
      await this.recordChange(documentId, changes, userId);

      console.log(
        `Alterações no documento ${documentId} feitas por ${userId} foram notificadas`
      );
    } catch (error) {
      console.error("Erro ao notificar alterações no documento:", error);
    }
  }

  /**
   * Registra alteração de um documento no banco de dados
   * @param {String} documentId - ID do documento alterado
   * @param {Object} changes - Alterações feitas no documento
   * @param {String} userId - ID do usuário que fez as alterações
   */
  async recordChange(documentId, changes, userId) {
    try {
      // Verificar se userId é um ObjectId válido ou um socket ID
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);

      // Se não for um ObjectId válido, apenas atualizamos o conteúdo sem o lastEditedBy
      if (!isValidObjectId) {
        await Document.findByIdAndUpdate(documentId, {
          $set: {
            ...changes,
            updatedAt: new Date(),
          },
        });
      } else {
        // Se for um ObjectId válido, podemos atualizar o lastEditedBy também
        await Document.findByIdAndUpdate(documentId, {
          $set: {
            ...changes,
            lastEditedBy: userId,
            updatedAt: new Date(),
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Erro ao registrar alteração no documento:", error);
      return false;
    }
  }

  /**
   * Verifica se um usuário tem permissões de acesso a um documento
   * @param {String} documentId - ID do documento
   * @param {String} userId - ID do usuário
   * @param {String} requiredPermission - Nível de permissão necessário ('read'|'write'|'admin')
   * @returns {Boolean} - Se o usuário tem a permissão solicitada
   */
  async checkPermission(documentId, userId, requiredPermission = "read") {
    try {
      // Buscar documento
      const document = await Document.findById(documentId);

      if (!document) return false;

      // Verificar se é o proprietário
      if (document.ownerId.toString() === userId) return true;

      // Verificar se é colaborador
      const isCollaborator = document.collaborators.some(
        (collaborator) => collaborator.toString() === userId
      );

      if (isCollaborator) return true;

      // Se o documento não está compartilhado e o usuário não é owner nem colaborador
      if (!document.isShared) return false;

      // Verificar compartilhamento específico
      const sharedWith = await SharedDocument.findOne({
        documentId,
        sharedWithId: userId,
      });

      if (!sharedWith) return false;

      // Verificar nível de permissão
      if (requiredPermission === "read") {
        // Qualquer nível permite leitura
        return true;
      } else if (requiredPermission === "write") {
        // Escrita ou admin permitem escrita
        return (
          sharedWith.permissions === "write" ||
          sharedWith.permissions === "admin"
        );
      } else if (requiredPermission === "admin") {
        // Somente admin permite admin
        return sharedWith.permissions === "admin";
      }

      return false;
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      return false;
    }
  }
}

module.exports = new DocumentService();
