/**
 * Middleware de validação para diferentes tipos de solicitações
 */

// Valida dados de registro
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];
  
  // Validar username
  if (!username) {
    errors.push('Nome de usuário é obrigatório');
  } else if (username.length < 3 || username.length > 30) {
    errors.push('Nome de usuário deve ter entre 3 e 30 caracteres');
  }
  
  // Validar email
  if (!email) {
    errors.push('Email é obrigatório');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Formato de email inválido');
    }
  }
  
  // Validar senha
  if (!password) {
    errors.push('Senha é obrigatória');
  } else if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  // Retornar erros ou seguir para o próximo middleware
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  next();
};

// Valida dados de login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  
  // Validar email
  if (!email) {
    errors.push('Email é obrigatório');
  }
  
  // Validar senha
  if (!password) {
    errors.push('Senha é obrigatória');
  }
  
  // Retornar erros ou seguir para o próximo middleware
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  next();
};

// Valida dados de criação de documento
const validateDocument = (req, res, next) => {
  const { title } = req.body;
  const errors = [];
  
  // Validar título
  if (!title) {
    errors.push('Título é obrigatório');
  } else if (title.length < 1 || title.length > 100) {
    errors.push('Título deve ter entre 1 e 100 caracteres');
  }
  
  // Retornar erros ou seguir para o próximo middleware
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  next();
};

// Valida dados de compartilhamento
const validateShare = (req, res, next) => {
  const { email, permission } = req.body;
  const errors = [];
  
  // Validar email
  if (!email) {
    errors.push('Email é obrigatório');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Formato de email inválido');
    }
  }
  
  // Validar permissão
  if (permission && !['read', 'write', 'admin'].includes(permission)) {
    errors.push('Permissão inválida. Deve ser: read, write ou admin');
  }
  
  // Retornar erros ou seguir para o próximo middleware
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  next();
};

// Valida dados para join by token sem exigir email
const validateShareToken = (req, res, next) => {
  const { shareToken } = req.body;
  const errors = [];
  
  // Validar token
  if (!shareToken) {
    errors.push('Token de compartilhamento é obrigatório');
  }
  
  // Retornar erros ou seguir para o próximo middleware
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  next();
};

// Valida dados de atualização de perfil
const validateProfile = (req, res, next) => {
  const { username, email } = req.body;
  const errors = [];
  
  // Validar username (se fornecido)
  if (username !== undefined) {
    if (username.length < 3 || username.length > 30) {
      errors.push('Nome de usuário deve ter entre 3 e 30 caracteres');
    }
  }
  
  // Validar email (se fornecido)
  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Formato de email inválido');
    }
  }
  
  // Retornar erros ou seguir para o próximo middleware
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  next();
};

// Valida dados de atualização de senha
const validatePasswordUpdate = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];
  
  // Validar senha atual
  if (!currentPassword) {
    errors.push('Senha atual é obrigatória');
  }
  
  // Validar nova senha
  if (!newPassword) {
    errors.push('Nova senha é obrigatória');
  } else if (newPassword.length < 6) {
    errors.push('Nova senha deve ter pelo menos 6 caracteres');
  }
  
  // Verificar se as senhas são diferentes
  if (currentPassword === newPassword) {
    errors.push('Nova senha deve ser diferente da senha atual');
  }
  
  // Retornar erros ou seguir para o próximo middleware
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateDocument,
  validateShare,
  validateShareToken,  // Exportando o novo middleware
  validateProfile,
  validatePasswordUpdate
};