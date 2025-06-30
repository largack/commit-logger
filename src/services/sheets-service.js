const { google } = require('googleapis');
const { Logger } = require('../utils/logger');
const { RetryUtil } = require('../utils/retry');

class SheetsService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.sheetName = process.env.SHEET_NAME || 'CommitLog';
    this.auth = this.initializeAuth();
  }

  initializeAuth() {
    const credentials = {
      type: 'service_account',
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    return google.auth.fromJSON(credentials);
  }

  async ensureHeaderRow() {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      // Check if header row exists
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:K1`,
      });

      // If no data or headers don't match, create/update header row
      if (!response.data.values || response.data.values.length === 0) {
        const headers = [
          'Timestamp',
          'Repository',
          'Branch', 
          'Commit SHA',
          'Author',
          'Commit Message',
          'Files Changed',
          'Lines Added',
          'Lines Deleted',
          'AI Explanation',
          'Commit URL'
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${this.sheetName}!A1:K1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers]
          }
        });

        console.log('✓ Header row created/updated');
      }
    } catch (error) {
      console.error('Error ensuring header row:', error);
      throw error;
    }
  }

  async appendRow(commitData) {
    try {
      Logger.debug('Appending row to Google Sheets', { sha: commitData.sha });
      
      return await RetryUtil.withRetry(async () => {
        await this.ensureHeaderRow();

        const sheets = google.sheets({ version: 'v4', auth: this.auth });
        
        const values = [
          commitData.timestamp,
          commitData.repository,
          commitData.branch,
          commitData.sha.substring(0, 8), // Short SHA
          commitData.author,
          commitData.message,
          commitData.filesChanged,
          commitData.additions,
          commitData.deletions,
          commitData.aiExplanation,
          commitData.commitUrl
        ];

        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: `${this.sheetName}!A:K`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [values]
          }
        });

        Logger.info(`Added row ${response.data.updates.updatedRows} to spreadsheet`);
        return response.data;
      }, 3, 1000);
      
    } catch (error) {
      Logger.error('Error appending to Google Sheets', { error: error.message });
      throw error;
    }
  }
}

module.exports = { SheetsService }; 