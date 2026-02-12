import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Chaves de armazenamento
  static ACCESS_TOKEN_KEY = 'accessToken';
  static REFRESH_TOKEN_KEY = 'refreshToken';
  static USER_DATA_KEY = 'userData';
  
  /**
   * Salva os tokens de autenticação
   * @param {string} accessToken - Token de acesso JWT
   * @param {string} refreshToken - Token de atualização JWT
   */
  async setTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.setItem(StorageService.ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(StorageService.REFRESH_TOKEN_KEY, refreshToken);
      }
      return true;
    } catch (error) {
      console.error('Erro ao salvar tokens:', error);
      return false;
    }
  }
  
  /**
   * Recupera os tokens de autenticação
   * @returns {Object|null} Objeto contendo accessToken e refreshToken ou null
   */
  async getTokens() {
    try {
      const accessToken = await AsyncStorage.getItem(StorageService.ACCESS_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(StorageService.REFRESH_TOKEN_KEY);
      
      if (!accessToken) {
        return null;
      }
      
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Erro ao recuperar tokens:', error);
      return null;
    }
  }
  
  /**
   * Limpa os tokens de autenticação
   */
  async clearTokens() {
    try {
      await AsyncStorage.removeItem(StorageService.ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(StorageService.REFRESH_TOKEN_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar tokens:', error);
      return false;
    }
  }
  
  /**
   * Salva os dados do usuário
   * @param {Object} userData - Dados do usuário
   */
  async setUserData(userData) {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(StorageService.USER_DATA_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      return false;
    }
  }
  
  /**
   * Recupera os dados do usuário
   * @returns {Object|null} Dados do usuário ou null
   */
  async getUserData() {
    try {
      const jsonValue = await AsyncStorage.getItem(StorageService.USER_DATA_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      return null;
    }
  }
  
  /**
   * Limpa os dados do usuário
   */
  async clearUserData() {
    try {
      await AsyncStorage.removeItem(StorageService.USER_DATA_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados do usuário:', error);
      return false;
    }
  }
}

export default new StorageService();
