import { baseApiService } from './BaseApiService';
import StorageService from './storage';

class AuthService {
  constructor() {
    this.api = baseApiService.api;
  }

  /**
   * Autentica um usuário
   * @param {Object} credentials - Credenciais (email e senha)
   * @returns {Promise} Promessa com dados do usuário e tokens
   */
  async login(credentials) {
    try {
      const response = await this.api.post('/api/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Erro de login:', error);
      throw error;
    }
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise} Promessa com dados do usuário e tokens
   */
  async register(userData) {
    try {
      const response = await this.api.post('/api/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Erro de registro:', error);
      throw error;
    }
  }

  /**
   * Faz logout do usuário atual
   * @returns {Promise} Promessa para conclusão do logout
   */
  async logout() {
    try {
      const token = await StorageService.getTokens();
      if (token && token.accessToken) {
        await this.api.post('/api/auth/logout', { accessToken: token.accessToken });
      }
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    } finally {
      // Limpar dados mesmo se houver erro na API
      baseApiService.setAuthToken(null);
      await StorageService.clearTokens();
      await StorageService.clearUserData();
    }
  }

  /**
   * Solicita redefinição de senha para o email fornecido
   * @param {string} email - Email do usuário
   * @returns {Promise} Promessa para solicitação de redefinição
   */
  async requestPasswordReset(email) {
    try {
      const response = await this.api.post('/api/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      throw error;
    }
  }

  /**
   * Redefine a senha usando o token enviado por email
   * @param {Object} resetData - Objeto com token e nova senha
   * @returns {Promise} Promessa para redefinição de senha
   */
  async resetPassword(resetData) {
    try {
      const response = await this.api.post('/api/auth/reset-password', resetData);
      return response;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }

  /**
   * Verifica se o token de redefinição de senha é válido
   * @param {string} token - Token de redefinição 
   * @returns {Promise} Promessa com status da validação
   */
  async verifyResetToken(token) {
    try {
      const response = await this.api.post('/api/auth/verify-reset-token', { token });
      return response;
    } catch (error) {
      console.error('Erro ao verificar token de redefinição:', error);
      throw error;
    }
  }

  /**
   * Define token de autenticação nos headers
   * @param {string} accessToken - Token de acesso
   * @param {string} refreshToken - Token de atualização
   */
  setAuthToken(accessToken, refreshToken = null) {
    baseApiService.setAuthToken(accessToken, refreshToken);
  }
}

export default new AuthService();
