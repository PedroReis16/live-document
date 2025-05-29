const socketEvents = {
  // Eventos de documento
  "join-document": (documentId) => {
    // Usuário entra na sala do documento
  },

  "leave-document": (documentId) => {
    // Usuário sai da sala do documento
  },

  "document-change": (documentId, changes) => {
    // Mudanças em tempo real no documento
    // Broadcast para outros colaboradores
  },

  "user-typing": (documentId, userId) => {
    // Indicador de usuário digitando
  },

  "cursor-position": (documentId, userId, position) => {
    // Posição do cursor em tempo real
  },
};
