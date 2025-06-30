require('dotenv').config();
const { GitHubService } = require('./services/github-service');
const { OpenAIService } = require('./services/openai-service');
const { SheetsService } = require('./services/sheets-service');
const { Logger } = require('./utils/logger');

class MergeRequestLogger {
  constructor() {
    this.githubService = new GitHubService();
    this.openaiService = new OpenAIService();
    this.sheetsService = new SheetsService();
  }

  async processMergeRequest() {
    try {
      // Get PR information from GitHub
      Logger.info('🔍 Fetching pull request information...');
      const prData = await this.githubService.getPullRequestData();
      
      if (!prData) {
        Logger.info('ℹ️ No pull request data found, skipping...');
        return;
      }

      Logger.info(`📋 Processing PR #${prData.number}: ${prData.title}`);
      Logger.info(`🏷️ Type: ${prData.type} | Branch: ${prData.sourceBranch} → ${prData.targetBranch}`);

      // Generate AI analysis of the merge request
      Logger.info('🤖 Generating AI analysis...');
      const aiAnalysis = await this.openaiService.analyzeMergeRequest(prData);

      // Prepare row data for Google Sheets (including enhanced metadata)
      const rowData = {
        timestamp: new Date().toISOString(),
        repository: prData.repository,
        prNumber: prData.number,
        title: prData.title,
        type: prData.type,
        sourceBranch: prData.sourceBranch,
        targetBranch: prData.targetBranch,
        author: prData.author,
        mergedBy: prData.mergedBy,
        mergedAt: prData.mergedAt,
        filesChanged: prData.filesChanged,
        additions: prData.additions,
        deletions: prData.deletions,
        commits: prData.commits,
        // Enhanced metadata from streamlined PR template
        linearTickets: prData.linearTickets || [],
        hasBreakingChanges: prData.hasBreakingChanges || false,
        securityImplications: prData.securityImplications || 'None',
        testingCompleted: prData.testingCompleted || 'Not specified',
        documentationUpdated: prData.documentationUpdated || 'Not needed',
        aiAnalysis: aiAnalysis,
        prUrl: prData.url
      };

      // Log to Google Sheets
      Logger.info('📊 Logging to Google Sheets...');
      await this.sheetsService.appendMergeRequestRow(rowData);

      Logger.info('✨ Successfully logged merge request to spreadsheet!');
      
    } catch (error) {
      Logger.error('Error processing merge request:', error.message);
      throw error;
    }
  }
}

module.exports = { MergeRequestLogger }; 