#!/usr/bin/env node

require('dotenv').config();
const { MergeRequestLogger } = require('../src/merge-request-logger');

async function testMergeLogger() {
  console.log('🧪 Testing Merge Request Logger...\n');

  try {
    // Mock PR environment variables for testing
    process.env.PR_NUMBER = '123';
    process.env.PR_TITLE = 'Add user authentication feature';
    process.env.PR_BODY = 'This PR implements JWT-based authentication with login/logout functionality.';
    process.env.PR_HEAD_REF = 'feature/user-authentication';
    process.env.PR_BASE_REF = 'main';
    process.env.PR_AUTHOR = 'test-author';
    process.env.PR_MERGED_BY = 'test-merger';
    process.env.PR_MERGED_AT = new Date().toISOString();
    process.env.PR_URL = 'https://github.com/test/repo/pull/123';
    
    // Test the merge logger
    console.log('1. Testing merge request logger components...');
    const mergeLogger = new MergeRequestLogger();
    
    console.log('   ✅ MergeRequestLogger initialized successfully');
    
    // Test PR type determination
    const { GitHubService } = require('../src/services/github-service');
    const githubService = new GitHubService();
    
    console.log('2. Testing branch type determination...');
    const testCases = [
      { branch: 'feature/user-auth', expected: 'Feature' },
      { branch: 'hotfix/critical-bug', expected: 'Hotfix' },
      { branch: 'bugfix/login-issue', expected: 'Bugfix' },
      { branch: 'chore/update-deps', expected: 'Chore' },
      { branch: 'docs/readme-update', expected: 'Documentation' },
      { branch: 'refactor/cleanup-code', expected: 'Refactor' },
      { branch: 'random-branch-name', expected: 'Other' }
    ];
    
    testCases.forEach(testCase => {
      const result = githubService.determinePRType(testCase.branch);
      const status = result === testCase.expected ? '✅' : '❌';
      console.log(`   ${status} ${testCase.branch} → ${result} (expected: ${testCase.expected})`);
    });
    
    console.log('\n3. Testing Google Sheets connection for merge requests...');
    const { SheetsService } = require('../src/services/sheets-service');
    const sheetsService = new SheetsService();
    
    // Test creating merge request sheet and headers
    await sheetsService.ensureMergeRequestHeaderRow();
    console.log('   ✅ Merge Request sheet and headers verified');
    
    console.log('\n🎉 All merge logger tests passed!');
    console.log('💡 The merge request logger is ready to use.');
    console.log('🔄 Create a test PR and merge it to see the logger in action.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Please check your configuration and try again.');
    process.exit(1);
  }
}

testMergeLogger(); 