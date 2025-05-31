const crypto = require('crypto');
const Document = require('../models/Document');
const SharedDocument = require('../models/SharedDocument');
const User = require('../models/User');

/**
 * Serviço para operações de compartilhamento de documentos
 */
class ShareService {
  /**
   * Compartilha um documento com outro usuário
   * @param {String} documentId - ID do documento a ser compartilhado
   * @param {String} ownerId - ID do usuário proprietário
   * @param {String} targetEmail - Email do usuário com quem compartilhar
   * @param {String} permission - Nível de permissão ('read'|'write'|'admin')
   * @returns {Object} - Resultado da operação
   */
  async shareWithUser(documentId, ownerId, targetEmail, permission = 'read') {
    try {
      // Verificar se o documento existe
      const document = await Document.findById(documentId);
      
      if (!document) {
        return { success: false, message: 'Documento não encontrado' };
      }
      
      // Verificar se o usuário é dono do documento
      if (document.ownerId.toString() !== ownerId) {
        return { success: false, message: 'Você não tem permissão para compartilhar este documento' };
      }
      
      // Buscar o usuário alvo pelo email
      const targetUser = await User.findOne({ email: targetEmail });
      
      if (!targetUser) {
        return { success: false, message: 'Usuário não encontrado' };
      }
      
      // Não permitir compartilhar com o próprio dono
      if (targetUser._id.toString() === ownerId) {
        return { success: false, message: 'Você não pode compartilhar um documento com você mesmo' };
      }
      
      // Verificar se já existe um compartilhamento para este usuário
      const existingShare = await SharedDocument.findOne({
        documentId,
        sharedWithId: targetUser._id
      });
      
      if (existingShare) {
        // Atualizar permissões se já existe
        existingShare.permissions = permission;
        await existingShare.save();
        
        return {
          success: true,
          message: 'Permissões de compartilhamento atualizadas',
          share: existingShare
        };
      }
      
      // Gerar código de compartilhamento
      const shareCode = this.generateShareCode();
      
      // Criar novo compartilhamento
      const newShare = new SharedDocument({
        documentId,
        ownerId,
        sharedWithId: targetUser._id,
        permissions: permission,
        shareCode
      });
      
      await newShare.save();
      
      // Atualizar o campo isShared do documento
      document.isShared = true;
      
      // Adicionar o usuário como colaborador se não estiver já
      if (!document.collaborators.includes(targetUser._id)) {
        document.collaborators.push(targetUser._id);
      }
      
      await document.save();
      
      return {
        success: true,
        message: 'Documento compartilhado com sucesso',
        share: newShare
      };
    } catch (error) {
      console.error('Erro ao compartilhar documento:', error);
      return { success: false, message: 'Erro ao compartilhar documento' };
    }
  }
  
  /**
   * Remove o compartilhamento de um documento com um usuário
   * @param {String} documentId - ID do documento
   * @param {String} ownerId - ID do usuário proprietário
   * @param {String} sharedWithId - ID do usuário com quem deixar de compartilhar
   * @returns {Object} - Resultado da operação
   */
  async removeShare(documentId, ownerId, sharedWithId) {
    try {
      // Verificar se o documento existe
      const document = await Document.findById(documentId);
      
      if (!document) {
        return { success: false, message: 'Documento não encontrado' };
      }
      
      // Verificar se o usuário é dono do documento
      if (document.ownerId.toString() !== ownerId) {
        return { success: false, message: 'Você não tem permissão para remover compartilhamentos deste documento' };
      }
      
      // Remover o compartilhamento
      const result = await SharedDocument.findOneAndDelete({
        documentId,
        sharedWithId
      });
      
      if (!result) {
        return { success: false, message: 'Compartilhamento não encontrado' };
      }
      
      // Remover o usuário da lista de colaboradores
      document.collaborators = document.collaborators.filter(
        id => id.toString() !== sharedWithId
      );
      
      // Verificar se ainda há compartilhamentos
      const remainingShares = await SharedDocument.countDocuments({ documentId });
      
      if (remainingShares === 0) {
        document.isShared = false;
      }
      
      await document.save();
      
      return {
        success: true,
        message: 'Compartilhamento removido com sucesso'
      };
    } catch (error) {
      console.error('Erro ao remover compartilhamento:', error);
      return { success: false, message: 'Erro ao remover compartilhamento' };
    }
  }
  
  /**
   * Gera um código de compartilhamento único
   * @returns {String} - Código de compartilhamento
   */
  generateShareCode() {
    return crypto.randomBytes(6).toString('hex');
  }
}

module.exports = new ShareService();