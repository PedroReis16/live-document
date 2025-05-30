const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  invalidateToken
} = require('../utils/jwt');

class AuthController {
  // POST /api/auth/register
  async register(req, res) {
    try {
      // Validar dados
      const { username, email, password, avatar } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos obrigatórios devem ser preenchidos' 
        });
      }
      
      // Verificar se usuário ou email já existem
      const existingUser = await User.findOne({ 
        $or: [{ username }, { email }]
      });
      
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'Usuário ou email já cadastrado' 
        });
      }
      
      // Criptografar senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Criar usuário
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        avatar
      });
      
      await newUser.save();
      
      // Não incluir a senha na resposta
      const userResponse = {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt
      };
      
      // Gerar tokens JWT
      const accessToken = generateAccessToken(userResponse);
      const refreshToken = generateRefreshToken({ id: newUser._id });
      
      // Retornar token + dados do usuário
      return res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        user: userResponse,
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao registrar usuário'
      });
    }
  }

  // POST /api/auth/login
  async login(req, res) {
    try {
      // Validar credenciais
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email e senha são obrigatórios' 
        });
      }
      
      // Buscar usuário
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciais inválidas' 
        });
      }
      
      // Verificar senha
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciais inválidas' 
        });
      }
      
      // Preparar objeto de resposta (sem senha)
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      };
      
      // Gerar tokens JWT
      const accessToken = generateAccessToken(userResponse);
      const refreshToken = generateRefreshToken({ id: user._id });
      
      // Retornar token + dados do usuário
      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        user: userResponse,
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao fazer login' 
      });
    }
  }

  // POST /api/auth/refresh
  async refreshToken(req, res) {
    try {
      // Validar refresh token
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ 
          success: false, 
          message: 'Refresh token é obrigatório' 
        });
      }
      
      // Verificar e decodificar o token
      const decoded = verifyRefreshToken(refreshToken);
      
      if (!decoded) {
        return res.status(401).json({ 
          success: false, 
          message: 'Refresh token inválido ou expirado' 
        });
      }
      
      // Buscar usuário
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuário não encontrado' 
        });
      }
      
      // Preparar objeto de resposta (sem senha)
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      };
      
      // Gerar novo access token
      const newAccessToken = generateAccessToken(userResponse);
      
      // Retornar novo access token
      return res.status(200).json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar token' 
      });
    }
  }

  // POST /api/auth/logout
  async logout(req, res) {
    try {
      // Invalidar token (blacklist)
      const { accessToken } = req.body;
      
      if (accessToken) {
        invalidateToken(accessToken);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao fazer logout' 
      });
    }
  }
}

module.exports = AuthController;
