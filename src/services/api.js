import { baseApiService } from './BaseApiService';
import authService from './auth';
import userService from './user';
import documentService from './documents';
import shareService from './share';

// Exporta a instância do serviço base
export const api = baseApiService.api;

// Cria um serviço combinado para compatibilidade retroativa
const ApiService = {
  // Métodos de autenticação
  login: authService.login.bind(authService),
  register: authService.register.bind(authService),
  logout: authService.logout.bind(authService),
  requestPasswordReset: authService.requestPasswordReset.bind(authService),
  resetPassword: authService.resetPassword.bind(authService),
  verifyResetToken: authService.verifyResetToken.bind(authService),
  setAuthToken: authService.setAuthToken.bind(authService),
  
  // Métodos de usuário
  getUserProfile: userService.getUserProfile.bind(userService),
  updateProfile: userService.updateProfile.bind(userService),
  updatePassword: userService.updatePassword.bind(userService),
  removeAvatar: userService.removeAvatar.bind(userService),
  updatePreferences: userService.updatePreferences.bind(userService),
  
  // Métodos de documentos
  getDocuments: documentService.getDocuments.bind(documentService),
  getDocument: documentService.getDocument.bind(documentService),
  createDocument: documentService.createDocument.bind(documentService),
  updateDocument: documentService.updateDocument.bind(documentService),
  deleteDocument: documentService.deleteDocument.bind(documentService),
  getDocumentHistory: documentService.getDocumentHistory.bind(documentService),
  restoreDocumentVersion: documentService.restoreDocumentVersion.bind(documentService),
  exportDocument: documentService.exportDocument.bind(documentService),
  
  // Métodos de compartilhamento
  shareWithUser: shareService.shareWithUser.bind(shareService),
  revokeAccess: shareService.revokeAccess.bind(shareService),
  updatePermission: shareService.updatePermission.bind(shareService),
  getShares: shareService.getShares.bind(shareService),
  generateShareLink: shareService.generateShareLink.bind(shareService),
  joinWithCode: shareService.joinWithCode.bind(shareService),
  joinByShareToken: shareService.joinByShareToken.bind(shareService),
  getSharedWithMeDocuments: shareService.getSharedWithMeDocuments?.bind(shareService),
};

// Exporta os serviços individuais para uso direto
export { 
  authService,
  userService,
  documentService,
  shareService,
};

// Exporta o serviço agregado como padrão para compatibilidade
export default ApiService;
