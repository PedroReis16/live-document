import { io } from "socket.io-client";
import { API_BASE_URL } from "../utils/constants";
import StorageService from "./storage";
import { baseApiService } from "./BaseApiService";

class SocketService {
  constructor() {
    this.socket = null;
    this.currentDocument = null;
    this.currentToken = null;
    this.handlers = {
      "document-change": [],
      "user-connected": [],
      "user-disconnected": [],
      "cursor-position": [],
      "user-typing": [],
      error: [],
    };
  }

  /**
   * Conecta ao servidor de socket
   * @param {String} token - Token JWT para autenticação
   */
  connect(token) {
    this.currentToken = token;

    if (this.socket && this.socket.connected) {
      console.log("Socket já está conectado");
      return;
    }

    this.socket = io(API_BASE_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  /**
   * Tenta reconectar usando o token mais recente
   */
  async reconnect() {
    // Sempre buscar o token mais recente do storage para garantir que não estamos usando um token expirado
    let token = null;

    try {
      const tokens = await StorageService.getTokens();
      if (tokens && tokens.accessToken) {
        token = tokens.accessToken;

        // Atualizar o token no serviço de API também para garantir consistência
        baseApiService.setAuthToken(tokens.accessToken, tokens.refreshToken);

        // Atualizar o token atual do socket
        this.currentToken = token;

        // Desconectar socket existente, se houver
        if (this.socket) {
          this.socket.disconnect();
        }

        // Conectar com o novo token
        this.connect(token);

        // Aguardar a conexão ser estabelecida
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.isSocketConnected());
          }, 1000);
        });
      }
    } catch (error) {
      console.error("Erro ao obter token para reconexão:", error);
      return false;
    }

    return false;
  }

  /**
   * Desconecta do servidor de socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentDocument = null;
      this.currentToken = null;
    }
  }

  /**
   * Verifica se o socket está conectado
   * @returns {Boolean} Status da conexão
   */
  isSocketConnected() {
    return this.socket && this.socket.connected;
  }

  /**
   * Configura os listeners padrão do socket
   */
  setupListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket conectado! ID:", this.socket.id);

      // Reconectar ao documento atual se necessário
      if (this.currentDocument) {
        console.log(
          `Reconectando ao documento ${this.currentDocument} após reconexão do socket`
        );
        this.socket.emit(
          "join-document",
          this.currentDocument,
          this.currentToken
        );
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Socket desconectado! Motivo: ${reason}`);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Erro de conexão socket:", error);
    });

    this.socket.on("auth-error", (data) => {
      console.error("Erro de autenticação socket:", data.message);
    });

    // Limpar e reconfigurar todos os listeners para os handlers registrados
    Object.keys(this.handlers).forEach((eventName) => {
      // Remover listeners anteriores para evitar duplicações
      if (this.socket.hasListeners && this.socket.hasListeners(eventName)) {
        this.socket.off(eventName);
      }

      // Registrar o listener para cada evento
      this.socket.on(eventName, (data) => {
        console.log(`Evento ${eventName} recebido:`, data);
        if (this.handlers[eventName] && this.handlers[eventName].length > 0) {
          this.handlers[eventName].forEach((handler) => {
            try {
              console.log("Data do evento:", data);
              handler(data);
            } catch (error) {
              console.error(`Erro ao processar evento ${eventName}:`, error);
            }
          });
        } else {
          console.warn(
            `Evento ${eventName} recebido, mas não há handlers registrados`
          );
        }
      });
    });
  }

  /**
   * Entra em um documento para colaboração
   * @param {String} documentId - ID do documento
   * @param {String} token - Token JWT opcional
   * @returns {Promise} Promessa resolvida quando conectado ao documento
   */
  joinDocument(documentId, token = null) {
    return new Promise(async (resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        return reject(new Error("Socket não está conectado"));
      }

      // Usar o token fornecido ou o mais recente armazenado
      const tokenToUse = token || this.currentToken;
      
      // Guardar o ID do documento atual
      this.currentDocument = documentId;

      // Enviar comando para entrar no documento
      console.log(`Entrando no documento ${documentId} com token ${tokenToUse ? 'válido' : 'inválido'}`);
      this.socket.emit("join-document", documentId, tokenToUse);

      // Aguardar evento de conexão com sucesso
      const onConnected = (users) => {
        console.log(`Conectado ao documento ${documentId} com sucesso`);
        this.socket.off("connected-users", onConnected);
        this.socket.off("auth-error", onError);
        this.socket.off("error", onError);
        resolve(users);
      };

      // Aguardar evento de erro
      const onError = (error) => {
        console.error(`Erro ao entrar no documento ${documentId}:`, error);
        this.socket.off("connected-users", onConnected);
        this.socket.off("auth-error", onError);
        this.socket.off("error", onError);
        
        // Se o erro for de autenticação, tentar obter token atualizado e tentar novamente
        if (error && (error.type === 'auth-error' || error === 'Unauthorized')) {
          console.log("Erro de autenticação, tentando obter token atualizado...");
          
          // Tentar reconectar com token atualizado
          this.reconnect()
            .then(reconnected => {
              if (reconnected) {
                console.log("Reconexão bem-sucedida, tentando entrar no documento novamente");
                // Tentar entrar no documento novamente após 500ms
                setTimeout(() => {
                  this.joinDocument(documentId)
                    .then(resolve)
                    .catch(reject);
                }, 500);
              } else {
                reject(new Error("Não foi possível reconectar com token atualizado"));
              }
            })
            .catch(err => {
              reject(new Error(`Falha na reconexão: ${err.message}`));
            });
        } else {
          reject(error);
        }
      };

      // Registrar listeners temporários
      this.socket.once("connected-users", onConnected);
      this.socket.once("auth-error", onError);
      this.socket.once("error", onError);
    });
  }

  /**
   * Sai de um documento
   * @param {String} documentId - ID do documento
   */
  leaveDocument(documentId) {
    if (this.socket && this.socket.connected) {
      console.log(`Saindo do documento ${documentId}`);
      this.socket.emit("leave-document", documentId);
      
      // Limpar referência ao documento atual
      if (this.currentDocument === documentId) {
        console.log(`Limpando referência ao documento atual: ${documentId}`);
        this.currentDocument = null;
      }
      
      // Remover ouvintes específicos deste documento
      try {
        this.socket.off(`document-content-${documentId}`);
        this.socket.off(`document-change-${documentId}`);
        console.log(`Listeners específicos do documento ${documentId} removidos`);
      } catch (error) {
        console.error(`Erro ao remover listeners do documento ${documentId}:`, error);
      }
    } else {
      console.warn("Tentativa de sair de documento com socket desconectado");
    }
  }

  /**
   * Envia alterações no documento para outros usuários
   * @param {String} documentId - ID do documento
   * @param {Object} changes - Alterações feitas no documento
   */
  sendDocumentChanges(documentId, changes) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("document-change", documentId, changes);
    }
  }

  /**
   * Método alternativo para enviar alterações no documento (alias para sendDocumentChanges)
   * @param {String} documentId - ID do documento
   * @param {Object} changes - Alterações feitas no documento
   */
  emitDocumentChange(documentId, changes) {
    this.sendDocumentChanges(documentId, changes);
  }

  /**
   * Notifica que o usuário está digitando
   * @param {String} documentId - ID do documento
   * @param {Boolean} isTyping - Se o usuário está digitando (default: true)
   */
  sendUserTyping(documentId, isTyping = true) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("user-typing", documentId, isTyping);
    }
  }

  /**
   * Método alternativo para notificar digitação (alias para sendUserTyping)
   * @param {String} documentId - ID do documento
   * @param {Boolean} isTyping - Se o usuário está digitando (default: true)
   */
  emitUserTyping(documentId, isTyping = true) {
    this.sendUserTyping(documentId, isTyping);
  }

  /**
   * Envia a posição do cursor do usuário
   * @param {String} documentId - ID do documento
   * @param {Object} position - Posição do cursor
   */
  sendCursorPosition(documentId, position) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("cursor-position", documentId, position);
    }
  }

  /**
   * Registra um handler para um evento de socket
   * @param {String} event - Nome do evento
   * @param {Function} handler - Função para tratar o evento
   */
  on(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event].push(handler);
    }
  }

  /**
   * Remove um handler de evento
   * @param {String} event - Nome do evento
   * @param {Function} handler - Função que foi registrada
   */
  off(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
    }
  }

  /**
   * Adiciona um listener para alterações de documento recebidas via socket
   * @param {Function} handler - Função para tratar alterações de documento
   * @returns {Function} Função para remover o listener
   */
  onDocumentChange(handler) {
    this.on("document-change", handler);
    return () => this.off("document-change", handler);
  }

  /**
   * Adiciona um listener para eventos de usuário digitando
   * @param {Function} handler - Função para tratar eventos de digitação
   * @returns {Function} Função para remover o listener
   */
  onUserTyping(handler) {
    this.on("user-typing", handler);
    return () => this.off("user-typing", handler);
  }

  /**
   * Adiciona um listener para eventos de colaborador entrando no documento
   * @param {Function} handler - Função para tratar eventos de entrada
   * @returns {Function} Função para remover o listener
   */
  onCollaboratorJoined(handler) {
    this.on("user-connected", handler);
    return () => this.off("user-connected", handler);
  }

  /**
   * Adiciona um listener para eventos de colaborador saindo do documento
   * @param {Function} handler - Função para tratar eventos de saída
   * @returns {Function} Função para remover o listener
   */
  onCollaboratorLeft(handler) {
    this.on("user-disconnected", handler);
    return () => this.off("user-disconnected", handler);
  }

  /**
   * Adiciona um listener para receber o conteúdo inicial de um documento
   * @param {Function} handler - Função para tratar o conteúdo inicial
   * @returns {Function} Função para remover o listener
   */
  onDocumentContent(handler) {
    this.on("document-content", handler);
    return () => this.off("document-content", handler);
  }
}

export default new SocketService();
