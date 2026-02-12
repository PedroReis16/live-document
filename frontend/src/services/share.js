// filepath: d:\Documentos\Code\Projetos\document-app\src\services\share.js
import { baseApiService } from "./BaseApiService";

class ShareService {
  constructor() {
    this.api = baseApiService.api;
  }

  /**
   * Compartilha um documento com um usuário pelo email
   * @param {String} documentId - ID do documento
   * @param {String} email - Email do destinatário
   * @param {String} permission - Permissão a conceder
   * @returns {Promise} Promessa com resultado do compartilhamento
   */
  async shareWithUser(documentId, email, permission = "read") {
    try {
      const response = await this.api.post(`/api/share/${documentId}`, {
        email,
        permission,
      });
      return response;
    } catch (error) {
      console.error("Erro ao compartilhar documento:", error);
      throw error;
    }
  }

  /**
   * Revoga acesso de um usuário a um documento
   * @param {String} documentId - ID do documento
   * @param {String} userId - ID do usuário
   * @returns {Promise} Promessa com resultado da operação
   */
  async revokeAccess(documentId, userId) {
    try {
      const response = await this.api.delete(
        `/api/share/${documentId}/${userId}`
      );
      return response;
    } catch (error) {
      console.error("Erro ao revogar acesso:", error);
      throw error;
    }
  }

  /**
   * Obtém lista de compartilhamentos de um documento
   * @param {String} documentId - ID do documento
   * @returns {Promise} Promessa com lista de compartilhamentos
   */
  async getShares(documentId) {
    try {
      console.log("Obtendo compartilhamentos para o documento:", documentId);
      const response = await this.api.get(`/api/share/${documentId}`);

      console.log("Compartilhamentos obtidos:", response.data);
      return response;
    } catch (error) {
      console.error("Erro ao obter compartilhamentos:", error);
      throw error;
    }
  }

  /**
   * Atualiza permissão de um usuário em um documento
   * @param {String} documentId - ID do documento
   * @param {String} userId - ID do usuário
   * @param {String} permission - Nova permissão
   * @returns {Promise} Promessa com resultado da operação
   */
  async updatePermission(documentId, userId, permission) {
    try {
      const response = await this.api.put(
        `/api/share/${documentId}/${userId}`,
        {
          permission,
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      throw error;
    }
  }

  /**
   * Gera um código de compartilhamento para um documento
   * @param {String} documentId - ID do documento
   * @returns {Promise} Promessa com código de compartilhamento
   */
  async generateShareCode(documentId) {
    try {
      const response = await this.api.post(`/api/share/${documentId}/code`);
      return response;
    } catch (error) {
      console.error("Erro ao gerar código de compartilhamento:", error);
      throw error;
    }
  }

  /**
   * Entra em um documento usando código de compartilhamento
   * @param {String} shareCode - Código de compartilhamento
   * @returns {Promise} Promessa com informações do documento
   */
  async joinWithCode(shareCode) {
    try {
      const response = await this.api.post("/api/share/join", { shareCode });
      return response;
    } catch (error) {
      console.error("Erro ao entrar com código de compartilhamento:", error);
      throw error;
    }
  }

  /**
   * Gera um link de compartilhamento para o documento
   * @param {String} documentId - ID do documento
   * @param {Object} options - Opções do link (permission, expiresIn)
   * @returns {Promise} Promessa com informações do link gerado
   */
  async generateShareLink(documentId, options = {}) {
    try {
      const response = await this.api.post(
        `/api/share/document/${documentId}/generate-link`,
        options
      );

      console.log("Link de compartilhamento gerado:", response);

      return response;
    } catch (error) {
      console.error("Erro ao gerar link de compartilhamento:", error);
      throw error;
    }
  }

  /**
   * Entra em um documento usando token de compartilhamento (via QR code ou URL)
   * @param {String} shareToken - Token do link de compartilhamento
   * @returns {Promise} Promessa com informações do documento
   */
  async joinByShareToken(shareToken) {
    try {
      console.log(shareToken);

      const response = await this.api.post("/api/share/join-by-token", {
        shareToken,
      });
      return response;
    } catch (error) {
      console.error("Erro ao entrar com token de compartilhamento:", error);
      throw error;
    }
  }

  /**
   * Obtém lista de colaboradores de um documento
   * @param {String} documentId - ID do documento
   * @returns {Promise} Promessa com lista de colaboradores
   */
  async getCollaborators(documentId) {
    try {
      const response = await this.api.get(
        `/api/share/${documentId}/collaborators`
      );
      console.log("Colaboradores obtidos:", response.data);
      return response.data; // Retornando response.data em vez de response
    } catch (error) {
      console.error("Erro ao obter colaboradores:", error);
      throw error;
    }
  }

  /**
   * Atualiza permissão de um colaborador em um documento
   * @param {String} documentId - ID do documento
   * @param {String} userId - ID do usuário
   * @param {String} permission - Nova permissão (read/write)
   * @returns {Promise} Promessa com resultado da operação
   */
  async updateCollaboratorPermission(documentId, userId, permission) {
    try {
      const response = await this.api.put(
        `/api/share/${documentId}/collaborators/${userId}`,
        {
          permission,
        }
      );
      console.log("Permissão atualizada:", response.data);
      return response.data; // Retornando response.data em vez de response
    } catch (error) {
      console.error("Erro ao atualizar permissão do colaborador:", error);
      throw error;
    }
  }

  /**
   * Remove um colaborador de um documento
   * @param {String} documentId - ID do documento
   * @param {String} userId - ID do usuário a ser removido
   * @returns {Promise} Promessa com resultado da operação
   */
  async removeCollaborator(documentId, userId) {
    try {
      const response = await this.api.delete(
        `/api/share/${documentId}/collaborators/${userId}`
      );
      console.log("Colaborador removido:", userId);
      return response.data; // Retornando response.data em vez de response
    } catch (error) {
      console.error("Erro ao remover colaborador:", error);
      throw error;
    }
  }

  /**
   * Obtém a permissão de um usuário em um documento específico
   * @param {String} documentId - ID do documento
   * @param {String} userId - ID do usuário
   * @returns {Promise} Promessa com a permissão do usuário no documento
   */
  async getUserDocumentPermission(documentId, userId) {
    try {
      // Primeiro, verificamos se o documento tem compartilhamentos para este usuário
      const response = await this.api.get(
        `/api/share/${documentId}/permission/${userId}`
      );
      console.log(
        `Permissão do usuário ${userId} no documento ${documentId}:`,
        response.data
      );
      // Se a resposta tiver um campo permission, esse é o nível de permissão do usuário
      if (response && response.data && response.data.permission) {
        console.log(
          `Usuário ${userId} tem permissão: ${response.data.permission}`
        );
        return { permission: response.data.permission };
      }

      // Se não houver permissão específica, assumir permissão de leitura
      return { permission: "read" };
    } catch (error) {
      console.error(
        `Erro ao verificar permissão do usuário ${userId} no documento ${documentId}:`,
        error
      );
      // Em caso de erro, assumimos que o usuário não tem permissão
      return { permission: "read" };
    }
  }

  // Métodos para configurar listeners de colaboração em tempo real
  setupCollaborationListeners(documentId, handlers) {
    // Importa o serviço de socket se ainda não estiver disponível
    if (!this.socketService) {
      import("./socket").then((module) => {
        this.socketService = module.default;
        this._setupListenersInternal(documentId, handlers);
      });
    } else {
      this._setupListenersInternal(documentId, handlers);
    }
  }

  // Método interno para configurar os listeners após garantir que o socketService existe
  _setupListenersInternal(documentId, handlers) {
    console.log(
      `Configurando listeners de colaboração para documento ${documentId}`
    );

    // Armazena os removedores de listeners para poder limpar depois
    this.listenerCleanups = [];

    // Configura os listeners de acordo com as handlers fornecidas
    if (handlers.onDocumentChange) {
      this.listenerCleanups.push(
        this.socketService.onDocumentChange((data) => {
          if (data.documentId === documentId) {
            handlers.onDocumentChange(data.changes);
          }
        })
      );
    }

    if (handlers.onUserTyping) {
      this.listenerCleanups.push(
        this.socketService.onUserTyping((docId, user, isTyping) => {
          if (docId === documentId) {
            handlers.onUserTyping(user, isTyping);
          }
        })
      );
    }

    if (handlers.onCollaboratorJoined) {
      this.listenerCleanups.push(
        this.socketService.onCollaboratorJoined((docId, userData) => {
          if (docId === documentId) {
            handlers.onCollaboratorJoined(userData);
          }
        })
      );
    }

    if (handlers.onCollaboratorLeft) {
      this.listenerCleanups.push(
        this.socketService.onCollaboratorLeft((docId, userData) => {
          if (docId === documentId) {
            handlers.onCollaboratorLeft(userData);
          }
        })
      );
    }

    if (handlers.onCursorPosition) {
      this.listenerCleanups.push(
        this.socketService.onCursorPosition((docId, user, position) => {
          if (docId === documentId) {
            handlers.onCursorPosition(user, position);
          }
        })
      );
    }

    // Notifica que estamos entrando no documento para colaboração
    this.socketService
      .joinDocument(documentId)
      .then((connectedUsers) => {
        if (handlers.onConnected) {
          handlers.onConnected(connectedUsers);
        }
      })
      .catch((error) => {
        console.error("Erro ao entrar no documento para colaboração:", error);
        if (handlers.onError) {
          handlers.onError(error);
        }
      });
  }

  removeCollaborationListeners() {
    console.log("Removendo listeners de colaboração");

    // Executa todas as funções de limpeza armazenadas
    if (this.listenerCleanups && this.listenerCleanups.length) {
      this.listenerCleanups.forEach((cleanup) => {
        if (typeof cleanup === "function") {
          try {
            cleanup();
          } catch (error) {
            console.error("Erro ao remover listener:", error);
          }
        }
      });

      // Limpa o array após remover os listeners
      this.listenerCleanups = [];
    }

    // Se estiver em um documento, sai dele
    if (this.socketService && this.socketService.currentDocument) {
      try {
        console.log(`Saindo do documento ${this.socketService.currentDocument}`);
        this.socketService.leaveDocument(this.socketService.currentDocument);
        this.socketService.currentDocument = null;
      } catch (error) {
        console.error("Erro ao sair do documento:", error);
      }
    }
  }
}

export default new ShareService();
