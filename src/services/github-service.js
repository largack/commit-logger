const { getOctokit } = require('@actions/github');
const { Logger } = require('../utils/logger');

class GitHubService {
  constructor() {
    this.octokit = getOctokit(process.env.GITHUB_TOKEN);
    this.repository = process.env.GITHUB_REPOSITORY;
    this.sha = process.env.GITHUB_SHA;
    this.ref = process.env.GITHUB_REF;
    this.actor = process.env.GITHUB_ACTOR;
  }

  async getCommitData() {
    try {
      Logger.debug('Fetching commit data from GitHub', { sha: this.sha });
      
      const [owner, repo] = this.repository.split('/');
      
      // Get commit details
      const { data: commit } = await this.octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: this.sha
      });

      // Get the diff for the commit
      const { data: comparison } = await this.octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: `${commit.sha}~1`,
        head: commit.sha
      });

      // Extract branch name from ref
      const branch = this.ref.replace('refs/heads/', '');

      // Prepare diff text for AI analysis
      const diffText = this.formatDiffForAI(comparison.files);
      
      Logger.debug('Successfully fetched commit data', { 
        files: commit.files?.length || 0,
        additions: commit.stats?.additions || 0,
        deletions: commit.stats?.deletions || 0
      });

      return {
        sha: commit.sha,
        author: commit.commit.author.name,
        authorEmail: commit.commit.author.email,
        message: commit.commit.message,
        timestamp: commit.commit.author.date,
        repository: this.repository,
        branch: branch,
        filesChanged: commit.files?.length || 0,
        additions: commit.stats?.additions || 0,
        deletions: commit.stats?.deletions || 0,
        url: commit.html_url,
        diff: diffText,
        files: comparison.files || []
      };
    } catch (error) {
      console.error('Error fetching commit data:', error);
      throw error;
    }
  }

  formatDiffForAI(files) {
    if (!files || files.length === 0) return 'No file changes detected.';

    let diffSummary = `Files changed: ${files.length}\n\n`;
    
    files.forEach(file => {
      diffSummary += `File: ${file.filename}\n`;
      diffSummary += `Status: ${file.status}\n`;
      diffSummary += `Changes: +${file.additions || 0} -${file.deletions || 0}\n`;
      
      // Include a portion of the patch for context (limit to avoid token overflow)
      if (file.patch) {
        const patchLines = file.patch.split('\n').slice(0, 20); // First 20 lines
        diffSummary += `Patch preview:\n${patchLines.join('\n')}\n`;
      }
      diffSummary += '\n---\n\n';
    });

    return diffSummary;
  }
}

module.exports = { GitHubService }; 