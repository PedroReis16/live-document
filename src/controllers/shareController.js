const Document = require('../models/Document');
const SharedDocument = require('../models/SharedDocument');
const ShareLink = require('../models/ShareLink');
const User = require('../models/User');
const shareService = require('../services/shareService');
const crypto = require('crypto');
const ms = require('ms');

class ShareController {
  /**
   * Compartilha um documento com outro usuário
   * @route POST /api/share/:documentId
   */
  async shareDocument(req, res) {
    try {
      const { documentId } = req.params;
      const { email, permission } = req.body;
      const ownerId = req.user.id;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email do destinatário é obrigatório'
        });
      }
      
      // Validar permissão
      const validPermissions = ['read', 'write', 'admin'];
      if (permission && !validPermissions.includes(permission)) {
        return res.status(400).json({
          success: false,
          message: 'Permissão inválida. Use: read, write ou admin'
        });
      }
      
      // Compartilhar documento usando o serviço
      const result = await shareService.shareWithUser(
        documentId,
        ownerId,
        email,
        permission || 'read'
      );
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao compartilhar documento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao compartilhar documento'
      });
    }
  }
  
  /**
   * Obtém todos os compartilhamentos de um documento
   * @route GET /api/share/:documentId
   */
  async getDocumentShares(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user.id;
      
      // Verificar se o documento existe
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento não encontrado'
        });
      }
      
      // Verificar se o usuário é dono do documento
      if (document.ownerId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para ver os compartilhamentos deste documento'
        });
      }
      
      // Buscar todos os compartilhamentos deste documento
      const shares = await SharedDocument.find({ documentId })
        .populate('sharedWithId', 'username email avatar');
      
      return res.status(200).json({
        success: true,
        data: shares
      });
    } catch (error) {
      console.error('Erro ao obter compartilhamentos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter compartilhamentos'
      });
    }
  }
  
  /**
   * Remove o compartilhamento de um documento
   * @route DELETE /api/share/:documentId/:userId
   */
  async removeShare(req, res) {
    try {
      const { documentId, userId: sharedWithId } = req.params;
      const ownerId = req.user.id;
      
      // Remover compartilhamento usando o serviço
      const result = await shareService.removeShare(
        documentId,
        ownerId,
        sharedWithId
      );
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao remover compartilhamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover compartilhamento'
      });
    }
  }
  
  /**
   * Atualiza as permissões de um compartilhamento
   * @route PUT /api/share/:documentId/:userId
   */
  async updateSharePermission(req, res) {
    try {
      const { documentId, userId: sharedWithId } = req.params;
      const { permission } = req.body;
      const ownerId = req.user.id;
      
      // Validar permissão
      const validPermissions = ['read', 'write', 'admin'];
      if (!permission || !validPermissions.includes(permission)) {
        return res.status(400).json({
          success: false,
          message: 'Permissão inválida. Use: read, write ou admin'
        });
      }
      
      // Verificar se o documento existe
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento não encontrado'
        });
      }
      
      // Verificar se o usuário é dono do documento
      if (document.ownerId.toString() !== ownerId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para alterar compartilhamentos deste documento'
        });
      }
      
      // Buscar o compartilhamento
      const share = await SharedDocument.findOne({
        documentId,
        sharedWithId
      });
      
      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Compartilhamento não encontrado'
        });
      }
      
      // Atualizar a permissão
      share.permissions = permission;
      await share.save();
      
      return res.status(200).json({
        success: true,
        message: 'Permissão atualizada com sucesso',
        share
      });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar permissão'
      });
    }
  }
  
  /**
   * Gera um link compartilhável para o documento
   * @route POST /api/share/document/:id/generate-link
   */
  async generateShareLink(req, res) {
    try {
      const { id } = req.params;
      const { permission = 'read', expiresIn = '7d' } = req.body;
      const userId = req.user.id;
      
      // Validar permissão
      const validPermissions = ['read', 'write', 'admin'];
      if (!validPermissions.includes(permission)) {
        return res.status(400).json({
          success: false,
          message: 'Permissão inválida. Use: read, write ou admin'
        });
      }
      
      // Verificar se o documento existe
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento não encontrado'
        });
      }
      
      // Verificar se o usuário pode compartilhar o documento
      if (document.ownerId.toString() !== userId) {
        // Se não for o dono, verificar se tem permissão adequada
        const share = await SharedDocument.findOne({
          documentId: id,
          sharedWithId: userId,
          permissions: { $in: ['write', 'admin'] }
        });
        
        if (!share) {
          return res.status(403).json({
            success: false,
            message: 'Você não tem permissão para compartilhar este documento'
          });
        }
      }
      
      // Gerar token único
      const shareToken = crypto.randomBytes(16).toString('hex');
      
      // Calcular data de expiração baseada no parâmetro expiresIn
      const expiresAt = new Date(Date.now() + ms(expiresIn));
      
      // Salvar no banco de dados
      const shareLink = await ShareLink.create({
        documentId: id,
        shareToken,
        createdBy: userId,
        permission,
        expiresAt
      });
      
      // Construir URL completa para compartilhamento
      // URL base deve ser obtida da configuração do ambiente
      const baseUrl = process.env.FRONTEND_URL || 'https://document-app.com';
      const shareUrl = `${baseUrl}/share/${shareToken}`;
      
      return res.status(200).json({
        success: true,
        shareToken,
        shareUrl,
        permission,
        expiresAt: shareLink.expiresAt
      });
    } catch (error) {
      console.error('Erro ao gerar link de compartilhamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar link de compartilhamento'
      });
    }
  }
  
  /**
   * Obtém informações de um documento através do token de compartilhamento
   * @route GET /api/share/link/:token
   */
  async getDocumentByToken(req, res) {
    try {
      const { token } = req.params;
      
      // Buscar link no banco de dados
      const shareLink = await ShareLink.findOne({
        shareToken: token,
        expiresAt: { $gt: new Date() }
      }).populate('documentId');
      
      // Verificar se o link existe e é válido
      if (!shareLink) {
        return res.status(404).json({
          success: false,
          message: 'Link de compartilhamento inválido ou expirado'
        });
      }
      
      // Incrementar contador de acesso
      shareLink.accessCount += 1;
      
      // Se o usuário estiver autenticado, registrar seu acesso
      if (req.user) {
        if (!shareLink.accessedBy.includes(req.user.id)) {
          shareLink.accessedBy.push(req.user.id);
        }
      }
      
      // Salvar alterações
      await shareLink.save();
      
      // Retornar informações do documento
      return res.status(200).json({
        success: true,
        documentId: shareLink.documentId._id,
        title: shareLink.documentId.title,
        permission: shareLink.permission
      });
    } catch (error) {
      console.error('Erro ao acessar documento por token:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar link de compartilhamento'
      });
    }
  }
  
  /**
   * Entra em um documento através de token de compartilhamento
   * @route POST /api/share/join-by-token
   */
  async joinByShareToken(req, res) {
    try {
      const { shareToken } = req.body;
      const userId = req.user.id;
      
      if (!shareToken) {
        return res.status(400).json({
          success: false,
          message: 'Token não fornecido'
        });
      }
      
      // Buscar link no banco de dados
      const shareLink = await ShareLink.findOne({
        shareToken,
        expiresAt: { $gt: new Date() }
      });
      
      // Verificar se o link existe e é válido
      if (!shareLink) {
        return res.status(404).json({
          success: false,
          message: 'Link de compartilhamento inválido ou expirado'
        });
      }
      
      // Verificar se já existe um compartilhamento para este usuário
      let share = await SharedDocument.findOne({
        documentId: shareLink.documentId,
        sharedWithId: userId
      });
      
      if (!share) {
        // Criar novo compartilhamento
        share = await SharedDocument.create({
          documentId: shareLink.documentId,
          sharedById: shareLink.createdBy,
          sharedWithId: userId,
          permissions: shareLink.permission
        });
      } else {
        // Atualizar permissão se a nova for superior
        const permissionLevels = { 'read': 1, 'write': 2, 'admin': 3 };
        if (permissionLevels[shareLink.permission] > permissionLevels[share.permissions]) {
          share.permissions = shareLink.permission;
          await share.save();
        }
      }
      
      // Registrar este usuário no link de compartilhamento
      if (!shareLink.accessedBy.includes(userId)) {
        shareLink.accessedBy.push(userId);
        shareLink.accessCount += 1;
        await shareLink.save();
      }
      
      // Retornar ID do documento para navegação
      return res.status(200).json({
        success: true,
        documentId: shareLink.documentId,
        permission: share.permissions,
        message: 'Acesso concedido ao documento'
      });
    } catch (error) {
      console.error('Erro ao entrar no documento via token:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar token de compartilhamento'
      });
    }
  }
  
  /**
   * Obtém a lista de colaboradores de um documento
   * @route GET /api/share/:documentId/collaborators
   */
  async getCollaborators(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user.id;
      
      // Verificar se o documento existe
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento não encontrado'
        });
      }
      
      // Verificar se o usuário tem acesso ao documento
      const isOwner = document.ownerId.toString() === userId;
      
      // Se não for proprietário, verificar se é colaborador
      if (!isOwner) {
        const hasAccess = await SharedDocument.findOne({
          documentId,
          sharedWithId: userId
        });
        
        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: 'Você não tem permissão para ver os colaboradores deste documento'
          });
        }
      }
      
      // Buscar o proprietário do documento
      const owner = await User.findById(document.ownerId)
        .select('_id name email username avatar');
      
      // Lista de colaboradores começando com o proprietário
      const collaborators = [{
        id: owner._id,
        name: owner.username || owner.name,
        email: owner.email,
        avatar: owner.avatar,
        role: 'owner',
        permission: 'admin',
        status: 'offline' // Status será atualizado pelo Socket.io se estiver online
      }];
      
      // Buscar compartilhamentos deste documento
      const shares = await SharedDocument.find({ documentId })
        .populate('sharedWithId', '_id name email username avatar');
      
      // Adicionar colaboradores à lista
      for (const share of shares) {
        if (share.sharedWithId) {
          collaborators.push({
            id: share.sharedWithId._id,
            name: share.sharedWithId.username || share.sharedWithId.name,
            email: share.sharedWithId.email,
            avatar: share.sharedWithId.avatar,
            role: 'collaborator',
            permission: share.permissions,
            status: 'offline' // Status será atualizado pelo Socket.io se estiver online
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        data: collaborators
      });
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar colaboradores'
      });
    }
  }
  
  /**
   * Atualiza a permissão de um colaborador
   * @route PUT /api/share/:documentId/collaborators/:userId
   */
  async updateCollaboratorPermission(req, res) {
    try {
      const { documentId, userId } = req.params;
      const { permission } = req.body;
      const requestingUserId = req.user.id;
      
      // Verificar se o documento existe
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento não encontrado'
        });
      }
      
      // Verificar se o usuário solicitante é o proprietário
      const isOwner = document.ownerId.toString() === requestingUserId;
      
      if (!isOwner) {
        // Se não for proprietário, verificar se tem permissão de administrador
        const userShare = await SharedDocument.findOne({
          documentId,
          sharedWithId: requestingUserId,
          permissions: 'admin'
        });
        
        if (!userShare) {
          return res.status(403).json({
            success: false,
            message: 'Você não tem permissão para gerenciar colaboradores deste documento'
          });
        }
      }
      
      // Validar a permissão
      const validPermissions = ['read', 'write', 'admin'];
      if (!validPermissions.includes(permission)) {
        return res.status(400).json({
          success: false,
          message: 'Permissão inválida. Use: read, write ou admin'
        });
      }
      
      // Verificar se o usuário alvo é o proprietário (não pode alterar)
      if (document.ownerId.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível alterar as permissões do proprietário do documento'
        });
      }
      
      // Buscar e atualizar o compartilhamento
      const share = await SharedDocument.findOne({
        documentId,
        sharedWithId: userId
      });
      
      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Colaborador não encontrado'
        });
      }
      
      // Atualizar a permissão
      share.permissions = permission;
      await share.save();
      
      // Buscar dados do usuário para a resposta
      const collaborator = await User.findById(userId)
        .select('_id name email username avatar');
      
      return res.status(200).json({
        success: true,
        message: 'Permissão atualizada com sucesso',
        data: {
          id: collaborator._id,
          name: collaborator.username || collaborator.name,
          email: collaborator.email,
          avatar: collaborator.avatar,
          role: 'collaborator',
          permission: share.permissions
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar permissão de colaborador:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar permissão de colaborador'
      });
    }
  }
  
  /**
   * Remove um colaborador de um documento
   * @route DELETE /api/share/:documentId/collaborators/:userId
   */
  async removeCollaborator(req, res) {
    try {
      const { documentId, userId } = req.params;
      const requestingUserId = req.user.id;
      
      // Verificar se o documento existe
      const document = await Document.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Documento não encontrado'
        });
      }
      
      // Verificar se o usuário solicitante é o proprietário
      const isOwner = document.ownerId.toString() === requestingUserId;
      
      if (!isOwner) {
        // Se não for proprietário, verificar se tem permissão de administrador
        const userShare = await SharedDocument.findOne({
          documentId,
          sharedWithId: requestingUserId,
          permissions: 'admin'
        });
        
        if (!userShare) {
          return res.status(403).json({
            success: false,
            message: 'Você não tem permissão para gerenciar colaboradores deste documento'
          });
        }
      }
      
      // Verificar se o usuário alvo é o proprietário (não pode remover)
      if (document.ownerId.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível remover o proprietário do documento'
        });
      }
      
      // Buscar o compartilhamento para garantir que o colaborador existe
      const share = await SharedDocument.findOne({
        documentId,
        sharedWithId: userId
      });
      
      if (!share) {
        return res.status(404).json({
          success: false,
          message: 'Colaborador não encontrado'
        });
      }
      
      // Remover o colaborador da lista de colaboradores do documento
      document.collaborators = document.collaborators.filter(
        id => id.toString() !== userId
      );
      
      // Salvar o documento atualizado
      await document.save();
      
      // Remover o compartilhamento
      await SharedDocument.findOneAndDelete({
        documentId,
        sharedWithId: userId
      });
      
      return res.status(200).json({
        success: true,
        message: 'Colaborador removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover colaborador'
      });
    }
  }
}

module.exports = ShareController;
