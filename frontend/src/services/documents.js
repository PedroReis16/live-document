import { baseApiService } from "./BaseApiService";
import StorageService from "./storage";

class DocumentService {
  constructor() {
    this.api = baseApiService.api;
  }

  /**
   * Busca todos os documentos do usuário
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise} Promessa com lista de documentos
   */
  async getDocuments(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const url = `/api/documents${queryString ? `?${queryString}` : ""}`;

      const response = await this.api.get(url);
      return response;
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      throw error;
    }
  }

  /**
   * Busca um documento específico pelo ID
   * @param {string} id - ID do documento
   * @returns {Promise} Promessa com dados do documento
   */
  async getDocument(id) {
    try {
      const response = await this.api.get(`/api/documents/${id}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo documento
   * @param {Object} documentData - Dados do documento
   * @returns {Promise} Promessa com documento criado
   */
  async createDocument(documentData) {
    try {
      // Verificar se temos o token em memória
      const authHeader = this.api.defaults.headers.common["Authorization"];
      if (!authHeader) {
        // Se não tiver, buscar do storage e configurar
        const tokens = await StorageService.getTokens();
        if (tokens && tokens.accessToken) {
          this.api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${tokens.accessToken}`;
        } else {
          throw new Error("Usuário não autenticado");
        }
      }

      // Enviar requisição com log adicional para depuração
      const response = await this.api.post("/api/documents", documentData);
      return response;
    } catch (error) {
      console.error("Erro ao criar documento:", error);
      throw error;
    }
  }

  /**
   * Atualiza um documento existente
   * @param {string} id - ID do documento
   * @param {Object} documentData - Novos dados do documento
   * @returns {Promise} Promessa com documento atualizado
   */
  async updateDocument(id, documentData) {
    try {
      // Verificar se temos o token em memória
      const authHeader = this.api.defaults.headers.common["Authorization"];
      if (!authHeader) {
        // Se não tiver, buscar do storage e configurar
        const tokens = await StorageService.getTokens();
        if (tokens && tokens.accessToken) {
          this.api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${tokens.accessToken}`;
        } else {
          throw new Error("Usuário não autenticado");
        }
      }

      const response = await this.api.put(`/api/documents/${id}`, documentData);
      return response;
    } catch (error) {
      console.error(`Erro ao atualizar documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Exclui um documento
   * @param {string} id - ID do documento
   * @returns {Promise} Promessa para exclusão do documento
   */
  async deleteDocument(id) {
    try {
      const response = await this.api.delete(`/api/documents/${id}`);
      return response;
    } catch (error) {
      console.error(`Erro ao excluir documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca histórico de versões de um documento
   * @param {string} id - ID do documento
   * @returns {Promise} Promessa com histórico de versões
   */
  async getDocumentHistory(id) {
    try {
      const response = await this.api.get(`/api/documents/${id}/history`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar histórico do documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Restaura um documento para uma versão anterior
   * @param {string} id - ID do documento
   * @param {string} versionId - ID da versão
   * @returns {Promise} Promessa com documento restaurado
   */
  async restoreDocumentVersion(id, versionId) {
    try {
      const response = await this.api.post(`/api/documents/${id}/restore`, {
        versionId,
      });
      return response;
    } catch (error) {
      console.error(`Erro ao restaurar versão do documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Exporta um documento para um formato específico
   * @param {string} id - ID do documento
   * @param {string} format - Formato de exportação (pdf, docx, etc)
   * @returns {Promise} Promessa com URL do arquivo exportado
   */
  async exportDocument(id, format) {
    try {
      const response = await this.api.get(`/api/documents/${id}/export`, {
        params: { format },
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error(`Erro ao exportar documento ${id}:`, error);
      throw error;
    }
  }
}

export default new DocumentService();
