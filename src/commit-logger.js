require('dotenv').config();
const { GitHubService } = require('./services/github-service');
const { OpenAIService } = require('./services/openai-service');
const { SheetsService } = require('./services/sheets-service');
const { Logger } = require('./utils/logger');

class CommitLogger {
  constructor() {
    this.githubService = new GitHubService();
    this.openaiService = new OpenAIService();
    this.sheetsService = new SheetsService();
  }

  async processCommit() {
    try {
      // Get commit information from GitHub
      Logger.info('📊 Fetching commit information...');
      const commitData = await this.githubService.getCommitData();
      
      if (!commitData) {
        Logger.info('ℹ️ No commit data found, skipping...');
        return;
      }

      Logger.info(`📝 Processing commit: ${commitData.sha.substring(0, 7)} by ${commitData.author}`);

      // Generate AI explanation of the commit
      Logger.info('🤖 Generating AI explanation...');
      const aiExplanation = await this.openaiService.explainCommit(commitData);

      // Prepare row data for Google Sheets
      const rowData = {
        timestamp: new Date().toISOString(),
        repository: commitData.repository,
        branch: commitData.branch,
        sha: commitData.sha,
        author: commitData.author,
        message: commitData.message,
        filesChanged: commitData.filesChanged,
        additions: commitData.additions,
        deletions: commitData.deletions,
        aiExplanation: aiExplanation,
        commitUrl: commitData.url
      };

      // Log to Google Sheets
      Logger.info('📋 Logging to Google Sheets...');
      await this.sheetsService.appendRow(rowData);

      Logger.info('✨ Successfully logged commit to spreadsheet!');
      
    } catch (error) {
      Logger.error('Error processing commit:', error.message);
      throw error;
    }
  }
}

module.exports = { CommitLogger }; 