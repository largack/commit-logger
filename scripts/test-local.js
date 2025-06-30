#!/usr/bin/env node

require('dotenv').config();
const { Config } = require('../src/config');

async function testSetup() {
  console.log('🧪 Testing Commit Logger Setup...\n');

  try {
    // Test environment variables
    console.log('1. Testing environment variables...');
    Config.validate();
    console.log('   ✅ All required environment variables are set\n');

    // Test OpenAI connection
    console.log('2. Testing OpenAI connection...');
    const { OpenAIService } = require('../src/services/openai-service');
    const openaiService = new OpenAIService();
    
    const testCommitData = {
      repository: 'test/repo',
      branch: 'main',
      author: 'Test Author',
      message: 'Test commit message',
      filesChanged: 1,
      additions: 10,
      deletions: 5,
      diff: 'Test diff content'
    };
    
    const explanation = await openaiService.explainCommit(testCommitData);
    console.log('   ✅ OpenAI connection successful');
    console.log(`   📝 Test explanation: ${explanation.substring(0, 100)}...\n`);

    // Test Google Sheets connection
    console.log('3. Testing Google Sheets connection...');
    const { SheetsService } = require('../src/services/sheets-service');
    const sheetsService = new SheetsService();
    
    // Just test auth without writing data
    await sheetsService.ensureHeaderRow();
    console.log('   ✅ Google Sheets connection successful\n');

    console.log('🎉 All tests passed! Your setup is ready.');
    console.log('💡 You can now commit changes to trigger the GitHub Action.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Please check your configuration and try again.');
    console.log('📚 See README.md for troubleshooting tips.');
    process.exit(1);
  }
}

testSetup(); 