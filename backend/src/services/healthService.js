/**
 * Serviço para monitoramento de saúde do sistema
 */
const os = require('os');
const mongoose = require('mongoose');
const { version } = require('../../package.json');

class HealthService {
  /**
   * Verifica o status geral do sistema
   * @returns {Object} Status do sistema com vários componentes
   */
  async checkHealth() {
    const startTime = process.uptime();
    const uptime = this.formatUptime(startTime);
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version,
      uptime,
      database: await this.checkDatabaseStatus(),
      system: this.getSystemInfo(),
      socketStatus: global.socketConnections || 0
    };
  }

  /**
   * Verifica o estado da conexão com o banco de dados
   * @returns {Object} Status da conexão
   */
  async checkDatabaseStatus() {
    try {
      const state = mongoose.connection.readyState;
      const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      const status = stateMap[state] || 'unknown';
      const isConnected = state === 1;

      // Verificação adicional com uma operação simples no banco
      if (isConnected) {
        try {
          await mongoose.connection.db.admin().ping();
        } catch (error) {
          return {
            status: 'error',
            message: 'Ping to database failed',
            error: error.message
          };
        }
      }

      return {
        status: isConnected ? 'ok' : 'error',
        connection: status,
        host: isConnected ? mongoose.connection.host : null
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Obtém informações do sistema
   * @returns {Object} Informações de sistema
   */
  getSystemInfo() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    return {
      memory: {
        total: this.formatBytes(totalMemory),
        free: this.formatBytes(freeMemory),
        used: this.formatBytes(usedMemory),
        usagePercent: Math.round((usedMemory / totalMemory) * 100)
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'unknown',
        loadAvg: os.loadavg()
      },
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname()
    };
  }

  /**
   * Formata bytes para uma representação legível
   * @param {Number} bytes - Quantidade de bytes
   * @returns {String} - Valor formatado com unidade
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formata o tempo de atividade para uma representação legível
   * @param {Number} uptime - Tempo de atividade em segundos
   * @returns {String} - Tempo formatado
   */
  formatUptime(uptime) {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    
    return parts.join(' ');
  }
  
  /**
   * Atualiza o contador de conexões de socket
   * @param {Number} count - Número de conexões
   */
  static updateSocketConnections(count) {
    global.socketConnections = count;
  }
}

module.exports = new HealthService();