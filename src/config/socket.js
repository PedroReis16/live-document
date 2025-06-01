const { verifyAccessToken } = require("../utils/jwt");
const DocumentService = require("../services/documentService");
const documentService = require("../services/documentService");
const healthService = require("../services/healthService");
const Document = require("../models/Document"); // Importando o modelo Document diretamente

// Contador global de conexões
let connectionsCount = 0;

const socketEvents = {
  // Eventos de documento
  "join-document": (socket, io) => async (documentId, token) => {
    try {
      // Verificar permissões se um token estiver presente
      console.log("Verificando se o usuário possui um token");
      console.log("Token recebido:", token);
      if (token) {
        const userData = verifyAccessToken(token);
        console.log("Dados do usuário verificados:", userData);
        if (userData) {
          // Armazenar dados do usuário no objeto do socket
          socket.userData = userData;
          console.log(
            `Usuário ${userData.username} (${socket.id}) entrou no documento ${documentId}`
          );
        } else {
          console.log(`Token inválido ao entrar no documento ${documentId}`);
          socket.emit("auth-error", {
            message: "Token de autenticação inválido",
          });
          return;
        }
      } else {
        // Usuário anônimo
        socket.userData = { id: socket.id, username: "Anônimo" };
        console.log(
          `Usuário anônimo (${socket.id}) entrou no documento ${documentId}`
        );
      }
      console.log(
        `Usuário ${socket.userData.username} entrou no documento ${documentId}`
      );
      // Unir o socket à sala do documento
      socket.join(documentId);

      console.log("Buscando documento no banco de dados:", documentId);
      // Buscar o documento do banco de dados para verificar permissões
      const document = await Document.findById(documentId); // Usando diretamente o modelo Document
      console.log("Documento encontrado:", document);

      if (!document) {
        console.log(`Documento ${documentId} não encontrado`);
        socket.emit("error", { message: "Documento não encontrado" });
        socket.leave(documentId);
        return;
      }

      // Garantir que o ID seja consistente
      const normalizedDocument = {
        ...document.toObject(),
        id: document._id.toString(),
      };
      console.log("Documento normalizado:", normalizedDocument);

      // Lista de usuários conectados a este documento
      const room = io.sockets.adapter.rooms.get(documentId);
      console.log("Usuários conectados na sala:", room);
      const connectedClients = room ? Array.from(room) : [];
      console.log("Clientes conectados:", connectedClients);

      // Informar ao cliente que entrou com sucesso
      socket.emit("connected-users", {
        document: normalizedDocument,
        users: connectedClients.map((clientId) => {
          const client = io.sockets.sockets.get(clientId);
          return {
            socketId: clientId,
            userId: client?.userData?.id || clientId,
            username: client?.userData?.username || "Anônimo",
          };
        }),
      });

      // Notificar outros usuários na sala
      socket.to(documentId).emit("user-connected", {
        user: {
          socketId: socket.id,
          id: socket.userData.id,
          username: socket.userData.username,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Erro ao entrar no documento ${documentId}:`, error);
      socket.emit("error", { message: "Erro ao entrar no documento" });
    }
  },

  "leave-document": (socket, io) => (documentId) => {
    try {
      console.log(
        `Usuário ${
          socket.userData?.username || socket.id
        } saiu do documento ${documentId}`
      );
      socket.leave(documentId);

      // Notificar outros usuários
      const userData = socket.userData || { id: socket.id };
      io.to(documentId).emit("user-disconnected", {
        socketId: socket.id,
        userId: userData.id,
        username: userData.username,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Erro ao sair do documento ${documentId}:`, error);
    }
  },

  "document-change": (socket, io) => (documentId, changes) => {
    try {
      // Verificar se o usuário está autenticado para registrar o autor da alteração
      const userData = socket.userData || { id: socket.id };

      console.log(
        `Mudanças no documento ${documentId} por ${
          userData.username || "anônimo"
        }`
      );

      // Broadcast para todos na sala exceto o emissor
      socket.to(documentId).emit("document-change", {
        changes,
        userId: userData.id,
        username: userData.username,
        timestamp: new Date(),
      });

      // Opcionalmente, podemos registrar a alteração no banco de dados
      if (socket.userData) {
        documentService
          .recordChange(documentId, changes, userData.id)
          .catch((err) => console.error("Erro ao registrar alteração:", err));
      }
    } catch (error) {
      console.error(
        `Erro ao processar alterações no documento ${documentId}:`,
        error
      );
      socket.emit("error", {
        message: "Erro ao processar alterações no documento",
      });
    }
  },

  "user-typing": (socket, io) => (documentId, isTyping) => {
    try {
      const userData = socket.userData || {
        id: socket.id,
        username: "Anônimo",
      };
      console.log(
        `Usuário ${userData.username} está ${
          isTyping ? "digitando" : "parou de digitar"
        } no documento ${documentId}`
      );

      socket.to(documentId).emit("user-typing", {
        userId: userData.id,
        username: userData.username,
        isTyping,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Erro ao processar evento de digitação:`, error);
    }
  },

  "cursor-position": (socket, io) => (documentId, position) => {
    try {
      const userData = socket.userData || {
        id: socket.id,
        username: "Anônimo",
      };

      socket.to(documentId).emit("cursor-position", {
        userId: userData.id,
        username: userData.username,
        position,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(`Erro ao processar posição do cursor:`, error);
    }
  },
};

// Configuração do Socket.IO
const configureSocket = (io) => {
  // Middleware para autenticação opcional
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token) {
      const userData = verifyAccessToken(token);
      if (userData) {
        socket.userData = userData;
        console.log(`Usuário autenticado conectado: ${userData.username}`);
      } else {
        console.log(`Token inválido recebido`);
      }
    }

    next();
  });

  io.on("connection", (socket) => {
    connectionsCount++;
    healthService.constructor.updateSocketConnections(connectionsCount);
    console.log(
      `Novo cliente conectado: ${socket.id}, Total: ${connectionsCount}`
    );

    // Registra eventos para este socket
    socket.on("join-document", socketEvents["join-document"](socket, io));
    socket.on("leave-document", socketEvents["leave-document"](socket, io));
    socket.on("document-change", socketEvents["document-change"](socket, io));
    socket.on("user-typing", socketEvents["user-typing"](socket, io));
    socket.on("cursor-position", socketEvents["cursor-position"](socket, io));

    socket.on("disconnect", () => {
      connectionsCount--;
      healthService.constructor.updateSocketConnections(connectionsCount);
      console.log(
        `Cliente desconectado: ${
          socket.userData?.username || socket.id
        }, Total: ${connectionsCount}`
      );
    });
  });
};

module.exports = configureSocket;
