require('dotenv').config();

class Config {
  static validate() {
    const required = [
      'OPENAI_API_KEY',
      'GOOGLE_SHEETS_SPREADSHEET_ID',
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_PRIVATE_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  static get openai() {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4'
    };
  }

  static get googleSheets() {
    return {
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      sheetName: process.env.SHEET_NAME || 'CommitLog'
    };
  }

  static get github() {
    return {
      token: process.env.GITHUB_TOKEN,
      repository: process.env.GITHUB_REPOSITORY,
      sha: process.env.GITHUB_SHA,
      ref: process.env.GITHUB_REF,
      actor: process.env.GITHUB_ACTOR
    };
  }

  static get logging() {
    return {
      level: process.env.LOG_LEVEL || 'info'
    };
  }
}

module.exports = { Config }; 