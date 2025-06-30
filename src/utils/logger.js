const { Config } = require('../config');

class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logLevel = Config.logging.level;
    
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    
    if (levels[level] <= levels[logLevel]) {
      const prefix = this.getEmoji(level);
      console.log(`${prefix} [${timestamp}] ${message}`);
      
      if (data && logLevel === 'debug') {
        console.log('   Data:', JSON.stringify(data, null, 2));
      }
    }
  }

  static getEmoji(level) {
    const emojis = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔍'
    };
    return emojis[level] || 'ℹ️';
  }

  static error(message, data = null) {
    this.log('error', message, data);
  }

  static warn(message, data = null) {
    this.log('warn', message, data);
  }

  static info(message, data = null) {
    this.log('info', message, data);
  }

  static debug(message, data = null) {
    this.log('debug', message, data);
  }
}

module.exports = { Logger }; 