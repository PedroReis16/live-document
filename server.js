require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Importar configurações
const connectDB = require('./src/config/database');
const socketConfig = require('./src/config/socket');
const { swaggerUi, specs } = require('./src/config/swagger');

// Importar serviços
const healthService = require('./src/services/healthService');

// Importar rotas
const authRoutes = require('./src/routes/auth');
const documentRoutes = require('./src/routes/documents');
const shareRoutes = require('./src/routes/share');
const userRoutes = require('./src/routes/users');

// Configuração do Express
const app = express();
const httpServer = createServer(app);

// Configuração do Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Conectar ao banco de dados
connectDB();

// Importar serviço de documentos para configurar Socket.IO
const documentService = require('./src/services/documentService');
documentService.setSocketIO(io);

// Configurar Socket.io
socketConfig(io);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'blob:'],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"] // Para o Swagger UI funcionar
    }
  }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar limiter a todas as rotas de API
app.use('/api', apiLimiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/users', userRoutes);

// Rotas de health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'document-api'
  });
});

app.get('/health/details', async (req, res) => {
  try {
    const healthData = await healthService.checkHealth();
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Erro ao verificar saúde do sistema:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Erro ao verificar saúde do sistema',
      error: error.message
    });
  }
});

// Tratamento de erro para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
});