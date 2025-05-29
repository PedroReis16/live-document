class AuthController {
  // POST /api/auth/register
  async register(req, res) {
    // Validar dados
    // Criptografar senha
    // Criar usuário
    // Gerar JWT
    // Retornar token + dados do usuário
  }

  // POST /api/auth/login
  async login(req, res) {
    // Validar credenciais
    // Verificar senha
    // Gerar JWT
    // Retornar token + dados do usuário
  }

  // POST /api/auth/refresh
  async refreshToken(req, res) {
    // Validar refresh token
    // Gerar novo access token
  }

  // POST /api/auth/logout
  async logout(req, res) {
    // Invalidar token (blacklist)
  }
}
