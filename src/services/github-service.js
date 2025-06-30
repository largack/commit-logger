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

  async getPullRequestData() {
    try {
      Logger.debug('Fetching pull request data from GitHub');
      
      const [owner, repo] = this.repository.split('/');
      const prNumber = process.env.PR_NUMBER;
      
      if (!prNumber) {
        Logger.warn('No PR_NUMBER found in environment');
        return null;
      }

      // Get PR details
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: parseInt(prNumber)
      });

      // Get PR diff/files
      const { data: files } = await this.octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: parseInt(prNumber)
      });

      // Get commits in PR
      const { data: commits } = await this.octokit.rest.pulls.listCommits({
        owner,
        repo,
        pull_number: parseInt(prNumber)
      });

      // Extract metadata from PR template
      const metadata = this.extractPRMetadata(pr.body || '');
      
      // Determine PR type (with template override support)
      const prType = this.determinePRType(pr.head.ref, pr.body);

      // Prepare diff text for AI analysis
      const diffText = this.formatDiffForAI(files);
      
      Logger.debug('Successfully fetched PR data', { 
        number: pr.number,
        files: files.length,
        commits: commits.length,
        type: prType,
        linearTickets: metadata.linearTickets.length
      });

      return {
        number: pr.number,
        title: pr.title,
        body: pr.body || '',
        type: prType,
        sourceBranch: pr.head.ref,
        targetBranch: pr.base.ref,
        author: pr.user.login,
        mergedBy: pr.merged_by?.login || 'Unknown',
        mergedAt: pr.merged_at,
        repository: this.repository,
        filesChanged: files.length,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        commits: commits.length,
        url: pr.html_url,
        diff: diffText,
        files: files,
        commitsList: commits,
        // Enhanced metadata from streamlined template
        linearTickets: metadata.linearTickets,
        hasBreakingChanges: metadata.hasBreakingChanges,
        securityImplications: metadata.securityImplications,
        testingCompleted: metadata.testingCompleted,
        documentationUpdated: metadata.documentationUpdated
      };
    } catch (error) {
      Logger.error('Error fetching PR data:', error.message);
      throw error;
    }
  }

  determinePRType(branchName, prBody = '') {
    // Check for manual type override in PR template (checked boxes)
    const typeOverrides = {
      '🚀 \\*\\*Feature\\*\\*': 'Feature',
      '🐛 \\*\\*Bugfix\\*\\*': 'Bugfix', 
      '🔥 \\*\\*Hotfix\\*\\*': 'Hotfix',
      '🧹 \\*\\*Chore\\*\\*': 'Chore',
      '📚 \\*\\*Documentation\\*\\*': 'Documentation',
      '♻️ \\*\\*Refactor\\*\\*': 'Refactor',
      '🎨 \\*\\*Style\\*\\*': 'Style',
      '🧪 \\*\\*Test\\*\\*': 'Test'
    };
    
    // Check for checked boxes in PR template
    for (const [pattern, type] of Object.entries(typeOverrides)) {
      const regex = new RegExp(`- \\[x\\] ${pattern}`, 'i');
      if (regex.test(prBody)) {
        return type;
      }
    }
    
    // Fall back to branch-based detection
    if (branchName.startsWith('feature/')) {
      return 'Feature';
    } else if (branchName.startsWith('hotfix/')) {
      return 'Hotfix';
    } else if (branchName.startsWith('bugfix/') || branchName.startsWith('fix/')) {
      return 'Bugfix';
    } else if (branchName.startsWith('chore/')) {
      return 'Chore';
    } else if (branchName.startsWith('docs/')) {
      return 'Documentation';
    } else if (branchName.startsWith('refactor/')) {
      return 'Refactor';
    } else if (branchName.startsWith('style/')) {
      return 'Style';
    } else if (branchName.startsWith('test/')) {
      return 'Test';
    } else {
      return 'Other';
    }
  }

  extractLinearTickets(prBody) {
    // Extract Linear ticket references from the streamlined template
    const linearRegex = /\[([A-Z]+-\d+)\]\(https:\/\/linear\.app\/[^)]+\)/g;
    const tickets = [];
    let match;
    
    while ((match = linearRegex.exec(prBody)) !== null) {
      tickets.push(match[1]);
    }
    
    return tickets;
  }

  extractPRMetadata(prBody) {
    const metadata = {
      linearTickets: this.extractLinearTickets(prBody),
      hasBreakingChanges: /\[x\].*contains breaking changes/i.test(prBody),
      securityImplications: this.extractSecurityStatus(prBody),
      testingCompleted: this.extractTestingStatus(prBody),
      documentationUpdated: this.extractDocumentationStatus(prBody)
    };
    
    return metadata;
  }

  extractSecurityStatus(prBody) {
    if (/\[x\].*security improvement/i.test(prBody)) return 'Improvement';
    if (/\[x\].*requires security review/i.test(prBody)) return 'Review Required';
    return 'None';
  }

  extractTestingStatus(prBody) {
    const testingChecks = [];
    if (/\[x\].*tested locally/i.test(prBody)) testingChecks.push('Local');
    if (/\[x\].*tests added/i.test(prBody)) testingChecks.push('Added/Updated');
    if (/\[x\].*manual testing/i.test(prBody)) testingChecks.push('Manual');
    
    return testingChecks.length > 0 ? testingChecks.join(', ') : 'Not specified';
  }

  extractDocumentationStatus(prBody) {
    if (/\[x\].*documentation updated/i.test(prBody)) return 'Updated';
    if (/\[x\].*documentation will be updated/i.test(prBody)) return 'Planned';
    return 'Not needed';
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
        const patchLines = file.patch.split('\n').slice(0, 15); // First 15 lines for PRs
        diffSummary += `Patch preview:\n${patchLines.join('\n')}\n`;
      }
      diffSummary += '\n---\n\n';
    });

    return diffSummary;
  }
}

module.exports = { GitHubService }; 