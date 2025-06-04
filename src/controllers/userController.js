const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Document = require('../models/Document');
const SharedDocument = require('../models/SharedDocument');
const imageService = require('../services/imageService');

class UserController {
  /**
   * Obtém o perfil do usuário atual
   * @route GET /api/users/me
   */
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuário'
      });
    }
  }
  
  /**
   * Obtém o perfil público de um usuário pelo username
   * @route GET /api/users/profile/:username
   */
  async getPublicProfile(req, res) {
    try {
      const { username } = req.params;
      
      const user = await User.findOne({ username }).select('username profileImage createdAt');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao buscar perfil público:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil público'
      });
    }
  }
  
  /**
   * Atualiza o perfil do usuário
   * @route PUT /api/users/me
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { 
        name, 
        username, 
        email, 
        bio, 
        preferences,
        profileImage
      } = req.body;
      
      // Verificar se já existe outro usuário com este username ou email
      if (username) {
        const existingUsername = await User.findOne({ 
          username, 
          _id: { $ne: userId } 
        });
        
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: 'Este nome de usuário já está em uso'
          });
        }
      }
      
      if (email) {
        const existingEmail = await User.findOne({ 
          email, 
          _id: { $ne: userId } 
        });
        
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Este email já está em uso'
          });
        }
      }
      
      // Atualizar perfil
      const updateData = {};
      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (bio !== undefined) updateData.bio = bio;
      if (preferences) updateData.preferences = preferences;
      
      // Tratar a imagem de perfil - aceitar diretamente como string base64
      if (profileImage) {
        // Verificar se é uma string base64 válida
        if (typeof profileImage === 'string' && profileImage.includes('base64')) {
          updateData.profileImage = profileImage;
        }
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        updateData,
        { new: true }
      ).select('-password');
      
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil'
      });
    }
  }
  
  /**
   * Atualiza a senha do usuário
   * @route PUT /api/users/me/password
   */
  async updatePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual e nova senha são obrigatórias'
        });
      }
      
      // Validar senha atual
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }
      
      // Criptografar nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Atualizar senha
      user.password = hashedPassword;
      await user.save();
      
      return res.status(200).json({
        success: true,
        message: 'Senha atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar senha'
      });
    }
  }
  
  /**
   * Atualiza o avatar do usuário
   * @route POST /api/users/me/avatar
   */
  async updateAvatar(req, res) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum avatar enviado'
        });
      }
      
      // Converter imagem para base64 e salvar diretamente no MongoDB
      const profileImageBase64 = await imageService.fileToBase64(req.file.path);
      
      // Atualizar usuário com a imagem em base64
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileImage: profileImageBase64 },
        { new: true }
      ).select('-password');
      
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Avatar atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar avatar'
      });
    }
  }
  
  /**
   * Remove o avatar/imagem do perfil do usuário
   * @route DELETE /api/users/me/avatar
   */
  async removeAvatar(req, res) {
    try {
      const userId = req.user.id;
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileImage: null },
        { new: true }
      ).select('-password');
      
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Imagem de perfil removida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover imagem de perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover imagem de perfil'
      });
    }
  }
  
  /**
   * Exclui a conta do usuário
   * @route DELETE /api/users/me
   */
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      
      // Buscar todos os documentos do usuário
      const userDocuments = await Document.find({ ownerId: userId });
      
      // Excluir todos os compartilhamentos relacionados
      for (const doc of userDocuments) {
        await SharedDocument.deleteMany({ documentId: doc._id });
      }
      
      // Excluir todos os documentos do usuário
      await Document.deleteMany({ ownerId: userId });
      
      // Excluir todos os compartilhamentos com este usuário
      await SharedDocument.deleteMany({ sharedWithId: userId });
      
      // Finalmente, excluir o usuário
      await User.findByIdAndDelete(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Conta excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao excluir conta'
      });
    }
  }
}

module.exports = new UserController();
