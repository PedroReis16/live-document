const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware para verificar autenticação com JWT
 * Verifica o token na requisição e adiciona o usuário decodificado
 * ao objeto da requisição se o token for válido
 */
function authenticate(req, res, next) {
  // Obter o token do cabeçalho de autorização
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso não fornecido'
    });
  }
  
  // Extrair o token sem o prefixo 'Bearer '
  const token = authHeader.split(' ')[1];
  
  // Verificar o token
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
  
  // Adicionar os dados do usuário decodificado à requisição
  req.user = decoded;
  
  // Seguir para o próximo middleware ou rota
  next();
}

module.exports = authenticate;