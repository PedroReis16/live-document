import { baseApiService } from "./BaseApiService";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from 'expo-image-manipulator';

class UserService {
  constructor() {
    this.api = baseApiService.api;
  }

  /**
   * Busca o perfil do usuário atual
   * @returns {Promise} Promessa com dados do perfil
   */
  async getUserProfile() {
    try {
      const response = await this.api.get("/api/users/me");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      throw error;
    }
  }

  /**
   * Atualiza o perfil do usuário
   * @param {Object} profileData - Novos dados do perfil
   * @returns {Promise} Promessa com perfil atualizado
   */
  async updateProfile(profileData) {
    try {
      // Criar objeto com os dados atualizados (sem a imagem)
      const updatedData = {
        username: profileData.username || "",
      };

      console.log("Dados do perfil a serem atualizados:", profileData.username, profileData.email);

      // Se houver uma imagem de perfil para fazer upload, incluir como base64
      if (profileData.profileImage && typeof profileData.profileImage !== 'string' && profileData.profileImage.uri) {
        try {
          // Converter imagem para base64
          const base64Image = await this.simpleImageToBase64(profileData.profileImage.uri);
          
          // Adicionar a imagem base64 ao objeto de dados
          updatedData.profileImage = base64Image;
        } catch (imageError) {
          console.warn("Erro ao processar imagem:", imageError);
        }
      }
      
      // Enviar todos os dados em uma única requisição
      const response = await this.api.put("/api/users/me", updatedData);
      
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  }
  
  /**
   * Atualiza a senha do usuário
   * @param {Object} passwordData - Objeto com senha antiga e nova
   * @returns {Promise} Promessa para alteração de senha
   */
  async updatePassword(passwordData) {
    try {
      const response = await this.api.put(
        "/api/users/me/password",
        passwordData
      );
      return response;
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      throw error;
    }
  }

  /**
   * Converter imagem para base64
   * @param {String} uri - URI da imagem para converter
   * @returns {Promise<String>} String base64 da imagem
   */
  async simpleImageToBase64(uri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Erro ao converter imagem para base64:", error);
      throw error;
    }
  }

  /**
   * Remove avatar do usuário
   * @returns {Promise} Promessa para remoção do avatar
   */
  async removeAvatar() {
    try {
      const response = await this.api.delete("/api/users/me/avatar");
      return response;
    } catch (error) {
      console.error("Erro ao remover avatar:", error);
      throw error;
    }
  }

  /**
   * Atualiza preferências do usuário
   * @param {Object} preferences - Preferências do usuário
   * @returns {Promise} Promessa com preferências atualizadas
   */
  async updatePreferences(preferences) {
    try {
      const response = await this.api.put(
        "/api/users/me/preferences",
        preferences
      );
      return response;
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      throw error;
    }
  }
}

export default new UserService();
