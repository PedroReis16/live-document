import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ShareService from "../services/share";

// Async Thunks
export const shareWithUser = createAsyncThunk(
  "share/shareWithUser",
  async ({ documentId, email, permission }, { rejectWithValue }) => {
    try {
      const response = await ShareService.shareWithUser(
        documentId,
        email,
        permission
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Erro ao compartilhar documento");
    }
  }
);

export const generateShareCode = createAsyncThunk(
  "share/generateShareCode",
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await ShareService.generateShareCode(documentId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Erro ao gerar código de compartilhamento"
      );
    }
  }
);

export const joinWithCode = createAsyncThunk(
  "share/joinWithCode",
  async (shareCode, { rejectWithValue }) => {
    try {
      const response = await ShareService.joinWithCode(shareCode);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Código inválido ou expirado");
    }
  }
);

// Generate share link
export const generateShareLink = createAsyncThunk(
  "share/generateShareLink",
  async ({ documentId, options }, { rejectWithValue }) => {
    try {
      const response = await ShareService.generateShareLink(
        documentId,
        options
      );
      // Retornamos apenas o token, desconsiderando a URL
      return {
        shareToken: response.shareToken,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Erro ao gerar token de compartilhamento"
      );
    }
  }
);

export const joinByShareToken = createAsyncThunk(
  "share/joinByShareToken",
  async (shareToken, { rejectWithValue }) => {
    try {
      const response = await ShareService.joinByShareToken(shareToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Token inválido ou expirado");
    }
  }
);

export const processDeepLinkToken = createAsyncThunk(
  "share/processDeepLinkToken",
  async (shareToken, { dispatch, rejectWithValue }) => {
    try {
      // Verificar se o usuário está autenticado antes de processar o token
      // Isso é feito no AppNavigator que só chama essa action quando isAuthenticated = true

      // Usar o token para entrar no documento
      const response = await dispatch(joinByShareToken(shareToken)).unwrap();

      // Limpar o token após o processamento
      dispatch(clearDeepLinkToken());

      return {
        documentId: response.documentId,
        permission: response.permission,
      };
    } catch (error) {
      dispatch(clearDeepLinkToken());
      return rejectWithValue(
        error.message || "Erro ao processar link de compartilhamento"
      );
    }
  }
);

export const fetchCollaborators = createAsyncThunk(
  "share/fetchCollaborators",
  async (documentId, { rejectWithValue }) => {
    try {
      console.log("Buscando colaboradores para o documento:", documentId);
      const response = await ShareService.getCollaborators(documentId);
      console.log("Colaboradores recebidos:", response);
      // response já é o array de colaboradores diretamente, pois corrigimos o serviço
      return response;
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
      return rejectWithValue(error.message || "Erro ao carregar colaboradores");
    }
  }
);

export const updatePermission = createAsyncThunk(
  "share/updatePermission",
  async ({ documentId, userId, permission }, { rejectWithValue }) => {
    try {
      const response = await ShareService.updateCollaboratorPermission(
        documentId,
        userId,
        permission
      );
      return { userId, permission, ...response };
    } catch (error) {
      return rejectWithValue(error.message || "Erro ao atualizar permissão");
    }
  }
);

export const removeCollaborator = createAsyncThunk(
  "share/removeCollaborator",
  async ({ documentId, userId }, { rejectWithValue }) => {
    try {
      await ShareService.removeCollaborator(documentId, userId);
      return { userId };
    } catch (error) {
      return rejectWithValue(error.message || "Erro ao remover colaborador");
    }
  }
);

const shareSlice = createSlice({
  name: "share",
  initialState: {
    loading: false,
    error: null,
    shareCode: null,
    shareLink: null,
    // Removido shareLinkUrl pois não será mais usado
    deepLinkToken: null,
    collaborators: [],
  },
  reducers: {
    resetShareState: (state) => {
      state.loading = false;
      state.error = null;
      state.shareCode = null;
      state.shareLink = null;
      // Removido shareLinkUrl
      // Mantém os colaboradores e deepLinkToken, pois esses não devem ser limpos ao trocar de documento
    },
    clearDeepLinkToken: (state) => {
      state.deepLinkToken = null;
    },
    setDeepLinkToken: (state, action) => {
      state.deepLinkToken = action.payload;
    },
    // Adiciona uma nova action para limpar TODOS os estados (usado ao sair completamente da tela)
    clearAllShareState: (state) => {
      state.loading = false;
      state.error = null;
      state.shareCode = null;
      state.shareLink = null;
      // Removido shareLinkUrl
      state.deepLinkToken = null;
      state.collaborators = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Share with user
      .addCase(shareWithUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shareWithUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(shareWithUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate share code
      .addCase(generateShareCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateShareCode.fulfilled, (state, action) => {
        state.loading = false;
        state.shareCode = action.payload.code;
      })
      .addCase(generateShareCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Join with code
      .addCase(joinWithCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinWithCode.fulfilled, (state) => {
        state.loading = false;
        state.shareCode = null;
      })
      .addCase(joinWithCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate share link
      .addCase(generateShareLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateShareLink.fulfilled, (state, action) => {
        state.loading = false;
        state.shareLink = action.payload.shareToken;
        // Removida a atribuição de shareLinkUrl
      })
      .addCase(generateShareLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Join by share token
      .addCase(joinByShareToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinByShareToken.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(joinByShareToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Process deep link token
      .addCase(processDeepLinkToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processDeepLinkToken.fulfilled, (state) => {
        state.loading = false;
        state.deepLinkToken = null;
      })
      .addCase(processDeepLinkToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deepLinkToken = null;
      })

      // Fetch Collaborators
      .addCase(fetchCollaborators.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollaborators.fulfilled, (state, action) => {
        state.loading = false;
        state.collaborators = action.payload;
      })
      .addCase(fetchCollaborators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Collaborator Permission
      .addCase(updatePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.collaborators = state.collaborators.map((collaborator) =>
          collaborator.id === action.payload.userId
            ? { ...collaborator, permission: action.payload.permission }
            : collaborator
        );
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Collaborator
      .addCase(removeCollaborator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCollaborator.fulfilled, (state, action) => {
        state.loading = false;
        state.collaborators = state.collaborators.filter(
          (collaborator) => collaborator.id !== action.payload.userId
        );
      })
      .addCase(removeCollaborator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetShareState,
  clearDeepLinkToken,
  setDeepLinkToken,
  clearAllShareState,
} = shareSlice.actions;

export default shareSlice;
