/**
 * Funções auxiliares para uso em toda a aplicação
 */

/**
 * Sanitiza um objeto removendo campos sensíveis ou específicos
 * @param {Object} obj - Objeto a ser sanitizado
 * @param {Array} fieldsToRemove - Campos a serem removidos
 * @returns {Object} - Objeto sanitizado
 */
const sanitizeObject = (obj, fieldsToRemove = ['password']) => {
  if (!obj) return null;
  
  const sanitized = { ...obj };
  
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  
  return sanitized;
};

/**
 * Converte um objeto Mongoose para um objeto JavaScript puro
 * @param {Object} mongooseObject - Objeto do Mongoose
 * @returns {Object} - Objeto JavaScript puro
 */
const toObject = (mongooseObject) => {
  if (!mongooseObject) return null;
  
  if (mongooseObject.toObject && typeof mongooseObject.toObject === 'function') {
    return mongooseObject.toObject();
  }
  
  return mongooseObject;
};

/**
 * Gera um ID único para uso temporário
 * @returns {String} - ID único
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * Formata uma data para exibição
 * @param {Date} date - Data a ser formatada
 * @param {String} format - Formato desejado (short, long, etc.)
 * @returns {String} - Data formatada
 */
const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (format === 'short') {
    return dateObj.toLocaleDateString();
  } else if (format === 'long') {
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
  } else if (format === 'relative') {
    const now = new Date();
    const diff = now - dateObj;
    
    // Segundos
    if (diff < 60 * 1000) {
      return 'agora mesmo';
    }
    
    // Minutos
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    // Horas
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    // Dias
    if (diff < 30 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
    
    // Meses
    if (diff < 12 * 30 * 24 * 60 * 60 * 1000) {
      const months = Math.floor(diff / (30 * 24 * 60 * 60 * 1000));
      return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    
    // Anos
    const years = Math.floor(diff / (12 * 30 * 24 * 60 * 60 * 1000));
    return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  
  return dateObj.toISOString();
};

/**
 * Trunca um texto para um tamanho específico
 * @param {String} text - Texto a ser truncado
 * @param {Number} maxLength - Tamanho máximo
 * @returns {String} - Texto truncado
 */
const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

module.exports = {
  sanitizeObject,
  toObject,
  generateUniqueId,
  formatDate,
  truncateText
};