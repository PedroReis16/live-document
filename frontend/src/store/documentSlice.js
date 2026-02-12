import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import DocumentService from "../services/documents";
import SocketService from "../services/socket";
import StorageService from "../services/storage";
import ApiService from "../services/api";

// Nova ação para atualizações via socket sem triggering loading
export const receiveSocketUpdate = createAction(
  "documents/receiveSocketUpdate",
  (payload) => payload
);

// Async thunks
export const fetchDocuments = createAsyncThunk(
  "documents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await DocumentService.getDocuments();
      // Retornar response.data para lidar com o formato correto da resposta
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Erro ao carregar documentos");
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  "documents/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const document = await DocumentService.getDocument(id);
      return document;
    } catch (error) {
      return rejectWithValue(
        error.message || `Erro ao carregar documento ${id}`
      );
    }
  }
);

export const createDocument = createAsyncThunk(
  "documents/create",
  async (documentData, { rejectWithValue }) => {
    try {
      const document = await DocumentService.createDocument(documentData);
      return document;
    } catch (error) {
      return rejectWithValue(error.message || "Erro ao criar documento");
    }
  }
);

export const updateDocument = createAsyncThunk(
  "documents/update",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const document = await DocumentService.updateDocument(id, changes);
      return document;
    } catch (error) {
      return rejectWithValue(
        error.message || `Erro ao atualizar documento ${id}`
      );
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "documents/delete",
  async (id, { rejectWithValue }) => {
    try {
      await DocumentService.deleteDocument(id);
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.message || `Erro ao excluir documento ${id}`
      );
    }
  }
);

export const joinCollaboration = createAsyncThunk(
  "documents/joinCollaboration",
  async (documentId, { rejectWithValue, getState, dispatch }) => {
    try {
      // Guardar o ID do documento solicitado para verificação posterior
      const requestedDocId = documentId;
      
      // Obter tokens do Storage em vez de confiar apenas no estado do Redux
      let token = null;
      
      try {
        const tokens = await StorageService.getTokens();
        if (tokens && tokens.accessToken) {
          token = tokens.accessToken;
          // Atualizar o token no serviço de API para garantir consistência
          ApiService.setAuthToken(tokens.accessToken, tokens.refreshToken);
        }
      } catch (storageError) {
        console.log("Erro ao buscar tokens do storage:", storageError);
      }
      
      // Se não conseguiu do storage, tentar do estado do Redux como fallback
      if (!token) {
        const { auth } = getState();
        token = auth.token;
      }
      
      if (!token) {
        return rejectWithValue("Usuário não autenticado");
      }

      // Conectar socket se não estiver conectado
      if (!SocketService.isSocketConnected()) {
        SocketService.connect(token);
      }

      // Entrar no documento
      const response = await SocketService.joinDocument(documentId, token);
      console.log("Resposta joinDocument:", response);

      // Verificar se o socket retornou o conteúdo do documento
      // Isso acontece quando um colaborador entra em um documento compartilhado
      if (response && response.document) {
        const receivedDocId = response.document.id || response.document._id;
        
        // Verificar se o documento recebido é o mesmo que foi solicitado
        if (receivedDocId.toString() !== requestedDocId.toString()) {
          console.error(`Documento recebido (${receivedDocId}) diferente do solicitado (${requestedDocId})`);
          return rejectWithValue(`Documento incorreto carregado. Por favor, tente novamente.`);
        }
        
        // Normalizar o documento com o ID correto
        const normalizedDocument = {
          ...response.document,
          id: receivedDocId
        };
        
        // Atualizar o documento atual diretamente
        dispatch(setCurrentDocument(normalizedDocument));
      }

      // Configurar listeners para mudanças no documento
      SocketService.onDocumentChange((data) => {
        console.log("Recebida alteração via socket:", data);
        if (data.changes) {
          console.log("Recebidas alterações via socket:", data.changes);
          
          // Usar a nova action para atualizações via socket (sem loading)
          dispatch(
            receiveSocketUpdate({
              id: documentId,
              content: data.changes,
              userId: data.userId
            })
          );
        }
      });

      // Configurar listener para receber o conteúdo inicial do documento
      SocketService.onDocumentContent((data) => {
        if (data.document) {
          console.log("Conteúdo inicial recebido via socket:", data.document);
          console.log("Tipo do documento recebido:", typeof data.document);
          console.log("ID do documento solicitado:", requestedDocId);
          console.log("ID do documento recebido:", data.document.id || data.document._id);
          
          // Verificar se o documento recebido é o mesmo que foi solicitado
          const receivedDocId = data.document.id || data.document._id;
          if (receivedDocId.toString() !== requestedDocId.toString()) {
            console.error(`Conteúdo inicial: documento recebido (${receivedDocId}) diferente do solicitado (${requestedDocId})`);
            return;
          }
          
          // Normalizar o documento
          const normalizedDocument = {
            ...data.document,
            id: receivedDocId
          };
          
          // Atualizar o documento atual
          dispatch(setCurrentDocument(normalizedDocument));
        }
      });

      // Retornar apenas o ID do documento, sem a função de cleanup
      return { documentId };
      
    } catch (error) {
      console.error("Erro ao entrar na colaboração:", error);
      return rejectWithValue(error.message || "Erro ao entrar na colaboração");
    }
  }
);

export const leaveCollaboration = createAsyncThunk(
  "documents/leaveCollaboration",
  async (documentId, { rejectWithValue }) => {
    try {
      if (SocketService.isSocketConnected()) {
        SocketService.leaveDocument(documentId);
      }
      return { id: documentId };
    } catch (error) {
      return rejectWithValue(error.message || "Erro ao sair da colaboração");
    }
  }
);

const documentSlice = createSlice({
  name: "documents",
  initialState: {
    documents: [],
    currentDocument: null,
    loading: false,
    error: null,
    collaborationActive: false,
    collaborators: [],
    documentVersions: [],
    versionLoading: false,
    versionError: null,
  },
  reducers: {
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    updateDocumentContent: (state, action) => {
      const { id, content } = action.payload;

      // Atualizar documento atual se for o mesmo
      if (state.currentDocument && state.currentDocument.id === id) {
        state.currentDocument.content = content;
      }

      // Atualizar na lista se existir
      if (state.documents) {
        const documentInList = state.documents.find((doc) => doc.id === id);
        if (documentInList) {
          documentInList.content = content;
        }
      }
    },
    setCollaborators: (state, action) => {
      state.collaborators = action.payload;
    },
    addCollaborator: (state, action) => {
      const exists = state.collaborators.some(
        (c) => c.id === action.payload.id
      );
      if (!exists) {
        state.collaborators.push(action.payload);
      }
    },
    removeCollaborator: (state, action) => {
      state.collaborators = state.collaborators.filter(
        (c) => c.id !== action.payload
      );
    },
    updateCollaboratorStatus: (state, action) => {
      const { userId, status } = action.payload;
      const collaborator = state.collaborators.find((c) => c.id === userId);
      if (collaborator) {
        collaborator.status = status;
      }
    },
    setDocumentVersions: (state, action) => {
      state.documentVersions = action.payload;
    },
    clearCollaborationState: (state) => {
      state.collaborationActive = false;
      state.collaborators = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      // .addCase(fetchDocuments.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false; // Changed from true to false to indicate loading is complete
        
        // Processar a resposta garantindo que os documentos tenham um campo 'id'
        let documents = action.payload;
        let allDocuments = [];
        
        // Handle the server response format with "owned" and "shared" arrays
        if (documents && typeof documents === 'object') {
          if (documents.owned && Array.isArray(documents.owned)) {
            allDocuments = [...documents.owned];
          }
          
          if (documents.shared && Array.isArray(documents.shared)) {
            // Mark shared documents as shared
            const sharedDocs = documents.shared.map(doc => ({...doc, shared: true}));
            allDocuments = [...allDocuments, ...sharedDocs];
          }
          
          // For backward compatibility - in case the format is different
          if (documents.documents && Array.isArray(documents.documents)) {
            allDocuments = [...allDocuments, ...documents.documents];
          }
        }
        
        // Garantir que é um array
        if (!Array.isArray(allDocuments)) {
          allDocuments = [];
        }
        
        // Normalizar documentos para garantir que todos tenham um campo 'id'
        state.documents = allDocuments.map(doc => {
          // Se o documento já tiver um campo 'id', usá-lo; caso contrário, usar o '_id'
          if (!doc.id && doc._id) {
            return { ...doc, id: doc._id };
          }
          return doc;
        });
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch document by ID
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        
        // Normalizar o documento da mesma forma que nas outras funções
        let document = action.payload;
        
        // Se a resposta tem uma propriedade data, extrair o documento
        if (document && document.data) {
          document = document.data;
        }
        
        // Garantir que o documento tem um campo 'id'
        if (document && !document.id && document._id) {
          document = { ...document, id: document._id };
        }
        
        state.currentDocument = document;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create document
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;

        if (!Array.isArray(state.documents)) {
          state.documents = [];
        }

        // Normalizar o documento da mesma forma que na função fetchDocuments
        let newDoc = action.payload;
        
        // Se a resposta tem uma propriedade data, extrair o documento
        if (newDoc && newDoc.data) {
          newDoc = newDoc.data;
        }
        
        // Garantir que o documento tem um campo 'id'
        if (newDoc && !newDoc.id && newDoc._id) {
          newDoc = { ...newDoc, id: newDoc._id };
        }
        
        state.documents.unshift(newDoc);
        state.currentDocument = newDoc;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update document
      .addCase(updateDocument.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;

        // Normalizar o documento da resposta
        let updatedDoc = action.payload;
        
        // Se a resposta tem uma propriedade data, extrair o documento
        if (updatedDoc && updatedDoc.data) {
          updatedDoc = updatedDoc.data;
        }
        
        // Garantir que o documento tem um campo 'id'
        if (updatedDoc && !updatedDoc.id && updatedDoc._id) {
          updatedDoc = { ...updatedDoc, id: updatedDoc._id };
        }

        // Atualizar na lista se existir
        if (state.documents) {
          const index = state.documents.findIndex(
            (doc) => doc.id === updatedDoc.id
          );
          if (index !== -1) {
            // Atualizar documento existente
            state.documents[index] = updatedDoc;
          } else {
            // Se não encontrou, pode ser um documento que precisa ser adicionado à lista
            state.documents.unshift(updatedDoc);
          }

          // Remover documentos locais com o mesmo título (se existirem)
          if (!updatedDoc.id.startsWith('local_')) {
            state.documents = state.documents.filter(doc => 
              !(doc.id.startsWith('local_') && 
                doc.title === updatedDoc.title && 
                doc.id !== updatedDoc.id)
            );
          }
        }

        // Atualizar documento atual se for o mesmo
        if (
          state.currentDocument &&
          state.currentDocument.id === updatedDoc.id
        ) {
          state.currentDocument = updatedDoc;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        if (state.documents) {
          state.documents = state.documents.filter(
            (doc) => doc.id !== action.payload.id
          );
        }

        // Limpar documento atual se for o mesmo
        if (
          state.currentDocument &&
          state.currentDocument.id === action.payload.id
        ) {
          state.currentDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Join collaboration
      .addCase(joinCollaboration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCollaboration.fulfilled, (state) => {
        state.loading = false;
        state.collaborationActive = true;
      })
      .addCase(joinCollaboration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.collaborationActive = false;
      })

      // Leave collaboration
      .addCase(leaveCollaboration.fulfilled, (state) => {
        state.collaborationActive = false;
        state.collaborators = [];
      })

      // Receive socket update
      .addCase(receiveSocketUpdate, (state, action) => {
        const { id, content } = action.payload;

        // Atualizar documento atual se for o mesmo
        if (state.currentDocument && state.currentDocument.id === id) {
          state.currentDocument.content = content;
        }

        // Atualizar na lista se existir
        if (state.documents) {
          const documentInList = state.documents.find((doc) => doc.id === id);
          if (documentInList) {
            documentInList.content = content;
          }
        }
      });
  },
});

export const {
  setCurrentDocument,
  clearCurrentDocument,
  updateDocumentContent,
  setCollaborators,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorStatus,
  setDocumentVersions,
  clearCollaborationState,
} = documentSlice.actions;

export default documentSlice;
