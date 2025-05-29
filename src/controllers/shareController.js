const Document = require('../models/Document');
const SharedDocument = require('../models/SharedDocument');
const User = require('../models/User');
const shareService = require('../services/shareService');

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
}

module.exports = ShareController;
