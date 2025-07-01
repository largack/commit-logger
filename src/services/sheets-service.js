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
    // Use GoogleAuth with JWT credentials - this is the correct way for service accounts
    return new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  }

  async ensureHeaderRow() {
    try {
      const authClient = await this.auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      
      // First, ensure the sheet tab exists
      await this.ensureSheetExists(sheets);
      
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

  async ensureSheetExists(sheets) {
    try {
      // Get spreadsheet info to check existing sheets
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      // Check if our sheet already exists
      const sheetExists = spreadsheet.data.sheets.some(
        sheet => sheet.properties.title === this.sheetName
      );

      if (!sheetExists) {
        Logger.info(`Creating sheet "${this.sheetName}"`);
        
        // Create the new sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: this.sheetName
                }
              }
            }]
          }
        });

        Logger.info(`✓ Sheet "${this.sheetName}" created successfully`);
      }
    } catch (error) {
      Logger.error('Error ensuring sheet exists:', error.message);
      throw error;
    }
  }

  async appendRow(commitData) {
    try {
      Logger.debug('Appending row to Google Sheets', { sha: commitData.sha });
      
      return await RetryUtil.withRetry(async () => {
        await this.ensureHeaderRow();

        const authClient = await this.auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        
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

  async appendMergeRequestRow(mergeData) {
    try {
      Logger.debug('Appending merge request row to Google Sheets', { prNumber: mergeData.prNumber });
      
      return await RetryUtil.withRetry(async () => {
        await this.ensureMergeRequestHeaderRow();

        const authClient = await this.auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        
              const values = [
        mergeData.timestamp,
        mergeData.repository,
        `#${mergeData.prNumber}`,
        mergeData.title,
        mergeData.type,
        mergeData.sourceBranch,
        mergeData.targetBranch,
        mergeData.author,
        mergeData.mergedBy,
        mergeData.mergedAt,
        mergeData.filesChanged,
        mergeData.additions,
        mergeData.deletions,
        mergeData.commits,
        mergeData.linearTickets?.join(', ') || '',
        mergeData.hasBreakingChanges ? 'Yes' : 'No',
        mergeData.securityImplications || 'None',
        mergeData.testingCompleted || 'Not specified',
        mergeData.documentationUpdated || 'Not needed',
        mergeData.aiAnalysis,
        mergeData.prUrl
      ];

        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: `Merge Request!A:U`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [values]
          }
        });

        Logger.info(`Added merge request row ${response.data.updates.updatedRows} to spreadsheet`);
        return response.data;
      }, 3, 1000);
      
    } catch (error) {
      Logger.error('Error appending merge request to Google Sheets', { error: error.message });
      throw error;
    }
  }

  async ensureMergeRequestHeaderRow() {
    try {
      const authClient = await this.auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      
      // First, ensure the "Merge Request" sheet exists
      await this.ensureMergeRequestSheetExists(sheets);
      
      // Check if header row exists
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `Merge Request!A1:U1`,
      });

      // If no data or headers don't match, create/update header row
      if (!response.data.values || response.data.values.length === 0) {
        const headers = [
          'Timestamp',
          'Repository',
          'PR Number',
          'Title',
          'Type',
          'Source Branch',
          'Target Branch',
          'Author',
          'Merged By',
          'Merged At',
          'Files Changed',
          'Lines Added',
          'Lines Deleted',
          'Commits',
          'Linear Tickets',
          'Breaking Changes',
          'Security Status',
          'Testing Completed',
          'Documentation',
          'AI Analysis',
          'PR URL'
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Merge Request!A1:U1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers]
          }
        });

        Logger.info('✓ Merge Request header row created/updated');
      }
    } catch (error) {
      Logger.error('Error ensuring merge request header row:', error.message);
      throw error;
    }
  }

  async ensureMergeRequestSheetExists(sheets) {
    try {
      // Get spreadsheet info to check existing sheets
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      // Check if "Merge Request" sheet already exists
      const sheetExists = spreadsheet.data.sheets.some(
        sheet => sheet.properties.title === 'Merge Request'
      );

      if (!sheetExists) {
        Logger.info('Creating "Merge Request" sheet');
        
        // Create the new sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: 'Merge Request'
                }
              }
            }]
          }
        });

        Logger.info('✓ "Merge Request" sheet created successfully');
      }
    } catch (error) {
      Logger.error('Error ensuring Merge Request sheet exists:', error.message);
      throw error;
    }
  }

  async appendDocumentationRow(docData) {
    try {
      Logger.debug('Appending documentation row to Google Sheets', { type: docData.type });
      
      return await RetryUtil.withRetry(async () => {
        await this.ensureDocumentationHeaderRow();

        const authClient = await this.auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        
        const values = [
          docData.timestamp,
          docData.repository,
          docData.type,
          docData.format,
          docData.triggeredBy,
          docData.customPrompt,
          docData.includeCodeAnalysis ? 'Yes' : 'No',
          docData.generatedContent,
          docData.wordCount || '',
          docData.generationTime || '',
          docData.status || 'Completed'
        ];

        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: `Documentation!A:K`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [values]
          }
        });

        Logger.info(`Added documentation row ${response.data.updates.updatedRows} to spreadsheet`);
        return response.data;
      }, 3, 1000);
      
    } catch (error) {
      Logger.error('Error appending documentation to Google Sheets', { error: error.message });
      throw error;
    }
  }

  async ensureDocumentationHeaderRow() {
    try {
      const authClient = await this.auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      
      // First, ensure the "Documentation" sheet exists
      await this.ensureDocumentationSheetExists(sheets);
      
      // Check if header row exists
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `Documentation!A1:K1`,
      });

      // If no data or headers don't match, create/update header row
      if (!response.data.values || response.data.values.length === 0) {
        const headers = [
          'Timestamp',
          'Repository',
          'Documentation Type',
          'Output Format',
          'Triggered By',
          'Custom Prompt',
          'Include Code Analysis',
          'Generated Content',
          'Word Count',
          'Generation Time (ms)',
          'Status'
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Documentation!A1:K1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers]
          }
        });

        Logger.info('✓ Documentation header row created/updated');
      }
    } catch (error) {
      Logger.error('Error ensuring documentation header row:', error.message);
      throw error;
    }
  }

  async ensureDocumentationSheetExists(sheets) {
    try {
      // Get spreadsheet info to check existing sheets
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      // Check if "Documentation" sheet already exists
      const sheetExists = spreadsheet.data.sheets.some(
        sheet => sheet.properties.title === 'Documentation'
      );

      if (!sheetExists) {
        Logger.info('Creating "Documentation" sheet');
        
        // Create the new sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: 'Documentation'
                }
              }
            }]
          }
        });

        Logger.info('✓ "Documentation" sheet created successfully');
      }
    } catch (error) {
      Logger.error('Error ensuring Documentation sheet exists:', error.message);
      throw error;
    }
  }
}

module.exports = { SheetsService }; 