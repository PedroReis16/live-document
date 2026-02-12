import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './storage';
import { API_BASE_URL } from '../utils/constants';

class BaseApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.refreshTokenRequest = null;
    this.isInitialized = false;

    // Carregar tokens na inicialização
    this.loadStoredToken();
    
    // Configurar interceptores
    this.setupInterceptors();
  }
  
  // Carregar token armazenado
  async loadStoredToken() {
    try {
      const tokens = await StorageService.getTokens();
      if (tokens && tokens.accessToken) {
        this.setAuthToken(tokens.accessToken, tokens.refreshToken);
        this.isInitialized = true;
        console.log('Token carregado do storage com sucesso');
      } else {
        console.log('Nenhum token encontrado no storage');
      }
    } catch (error) {
      console.error('Erro ao carregar token do storage:', error);
    }
  }

  // Configurar interceptores para tratamento automático de tokens
  setupInterceptors() {
    // Interceptor de requisição
    this.api.interceptors.request.use(
      async (config) => {
        try {
          // Se já temos token no header, usar esse
          if (this.api.defaults.headers.common['Authorization']) {
            return config;
          }
          
          // Se não há token em memória e ainda não tentamos inicializar
          if (!this.isInitialized) {
            await this.loadStoredToken();
          }
          
          // Verificar novamente se temos token
          if (this.api.defaults.headers.common['Authorization']) {
            return config;
          } else {
            // Última tentativa de buscar do storage
            const tokens = await StorageService.getTokens();
            if (tokens && tokens.accessToken) {
              config.headers.Authorization = `Bearer ${tokens.accessToken}`;
              // Também atualiza o header default para futuras requisições
              this.api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
            }
          }
        } catch (error) {
          console.error('Erro ao configurar token na requisição:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de resposta
    this.api.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        const originalRequest = error.config;
        
        // Se erro 401 (não autorizado) e não foi uma tentativa de refresh token
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Tentar renovar o token
            const newToken = await this.refreshAuthToken();
            
            if (newToken) {
              // Configurar novo token no cabeçalho
              this.api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              
              // Refazer a requisição original com o novo token
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError);
            
            // Falha ao renovar token - logout
            await StorageService.clearTokens();
            await StorageService.clearUserData();
            
            // Emitir evento para forçar logout na aplicação
            // Usando abordagem diferente para React Native
            if (global.eventEmitter) {
              global.eventEmitter.emit('sessionExpired');
            }
          }
        }
        
        // Retornar o erro para ser tratado pelo chamador
        return Promise.reject(error);
      }
    );
  }

  // Definir token de autenticação
  setAuthToken(accessToken, refreshToken = null) {
    if (accessToken) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      console.log('Token definido nos headers: ' + accessToken.substring(0, 10) + '...');
    } else {
      delete this.api.defaults.headers.common['Authorization'];
      console.log('Token removido dos headers');
    }
  }

  // Renovar token de autenticação
  async refreshAuthToken() {
    // Evitar múltiplas requisições de refresh simultaneamente
    if (!this.refreshTokenRequest) {
      this.refreshTokenRequest = (async () => {
        const tokens = await StorageService.getTokens();
        
        if (!tokens || !tokens.refreshToken) {
          return null;
        }
        
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken: tokens.refreshToken
          });
          
          if (response.data && response.data.accessToken) {
            const newToken = response.data.accessToken;
            
            // Salvar novo token usando StorageService
            await StorageService.setTokens(newToken, tokens.refreshToken);
            
            return newToken;
          }
          return null;
        } catch (error) {
          console.error('Falha ao renovar token:', error);
          return null;
        } finally {
          this.refreshTokenRequest = null;
        }
      })();
    }
    
    return this.refreshTokenRequest;
  }
}

// Exportar uma instância para ser usada por outros serviços
export const baseApiService = new BaseApiService();

// Exportar a classe para herança
export default BaseApiService;