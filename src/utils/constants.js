// API Configuration
// export const API_BASE_URL = 'http://192.168.56.1:5000'; // Ajuste para o IP ou hostname do seu servidor
export const API_BASE_URL = 'http://10.0.0.145:5000'; // Ajuste para o IP ou hostname do seu servidor

// Authentication
export const TOKEN_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

// Document Types
export const DOCUMENT_TYPES = {
  TEXT: 'text',
  SPREADSHEET: 'spreadsheet',
  PRESENTATION: 'presentation'
};

// Document Permissions
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin'
};

// UI Constants
export const DEBOUNCE_TIME = 300; // milissegundos para debounce em inputs
export const AUTOSAVE_INTERVAL = 5000; // milissegundos entre auto-saves