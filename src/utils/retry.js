const { Logger } = require('./logger');

class RetryUtil {
  static async withRetry(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.debug(`Attempt ${attempt}/${maxRetries}`);
        return await fn();
      } catch (error) {
        lastError = error;
        Logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          Logger.error(`All ${maxRetries} attempts failed`);
          throw lastError;
        }
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        Logger.debug(`Waiting ${waitTime}ms before retry...`);
        await this.sleep(waitTime);
      }
    }
    
    throw lastError;
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { RetryUtil }; 