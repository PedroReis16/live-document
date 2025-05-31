const jwt = require('jsonwebtoken');

// Estas variáveis de ambiente devem estar definidas no arquivo .env
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

// Tokens inválidos (lista negra)
const tokenBlacklist = new Set();

/**
 * Gera um token JWT de acesso
 * @param {Object} payload - Dados para incluir no token
 * @returns {String} Token JWT
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Gera um token JWT para refresh
 * @param {Object} payload - Dados para incluir no token
 * @returns {String} Token JWT de refresh
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Verifica e decodifica um token JWT de acesso
 * @param {String} token - Token JWT para verificar
 * @returns {Object|null} Payload do token ou null se inválido
 */
function verifyAccessToken(token) {
  if (tokenBlacklist.has(token)) return null;
  
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verifica e decodifica um token JWT de refresh
 * @param {String} token - Token de refresh para verificar
 * @returns {Object|null} Payload do token ou null se inválido
 */
function verifyRefreshToken(token) {
  if (tokenBlacklist.has(token)) return null;
  
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Adiciona um token à lista negra (blacklist)
 * @param {String} token - Token a ser invalidado
 */
function invalidateToken(token) {
  tokenBlacklist.add(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  invalidateToken
};