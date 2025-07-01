#!/usr/bin/env node

const { DocumentationGenerator } = require('../src/documentation-generator');
const { Logger } = require('../src/utils/logger');

// Mock command line arguments for testing
process.argv = [
  'node',
  'test-documentation-generator.js',
  '--prompt', 'Generate a comprehensive developer guide for this commit logger project including setup instructions, architecture overview, and usage examples',
  '--type', 'Developer Guide',
  '--include-code', 'true',
  '--format', 'Structured',
  '--repository', 'test/commit-logger',
  '--triggered-by', 'test-user'
];

async function testDocumentationGenerator() {
  console.log('🧪 Testing Documentation Generator...\n');
  
  try {
    // Test argument parsing
    const generator = new DocumentationGenerator();
    const options = generator.parseArguments();
    
    console.log('✅ Arguments parsed successfully:');
    console.log('   Prompt:', options.prompt.substring(0, 100) + '...');
    console.log('   Type:', options.type);
    console.log('   Format:', options.format);
    console.log('   Include Code Analysis:', options['include-code']);
    console.log('   Repository:', options.repository);
    console.log('   Triggered By:', options['triggered-by']);
    console.log();
    
    // Test repository info gathering
    console.log('📊 Testing repository info gathering...');
    const repoInfo = await generator.gatherRepositoryInfo(options.repository, options['include-code']);
    
    console.log('✅ Repository info gathered:');
    console.log('   Project Structure:', repoInfo.projectStructure.substring(0, 100) + '...');
    console.log('   README Content:', repoInfo.readmeContent.substring(0, 100) + '...');
    console.log('   Package Info:', repoInfo.packageInfo.substring(0, 100) + '...');
    if (repoInfo.codeAnalysis) {
      console.log('   Code Analysis:', repoInfo.codeAnalysis.substring(0, 100) + '...');
    }
    console.log('   Gathering Time:', repoInfo.gatheringTime + 'ms');
    console.log();
    
    // Test documentation generation (only if API key is available)
    if (process.env.OPENAI_API_KEY) {
      console.log('🤖 Testing AI documentation generation...');
      
      const docResult = await generator.generateDocumentation(options, repoInfo);
      
      console.log('✅ Documentation generated:');
      console.log('   Word Count:', docResult.wordCount);
      console.log('   Generation Time:', docResult.generationTime + 'ms');
      console.log('   Content Preview:', docResult.content.substring(0, 200) + '...');
      console.log();
      
      // Test Google Sheets logging (only if credentials are available)
      if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        console.log('📊 Testing Google Sheets logging...');
        
        await generator.logToSheets(options, repoInfo, docResult);
        
        console.log('✅ Documentation logged to Google Sheets successfully');
        console.log(`🔗 Check: https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_SPREADSHEET_ID}`);
      } else {
        console.log('⚠️  Skipping Google Sheets test (credentials not configured)');
      }
    } else {
      console.log('⚠️  Skipping AI generation test (OPENAI_API_KEY not configured)');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 To run the full documentation generator:');
    console.log('node src/documentation-generator.js \\');
    console.log('  --prompt="Your custom prompt here" \\');
    console.log('  --type="General" \\');
    console.log('  --include-code="true" \\');
    console.log('  --format="Structured" \\');
    console.log('  --repository="your-repo-name" \\');
    console.log('  --triggered-by="username"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Function to test individual components
async function testComponents() {
  console.log('\n🔧 Testing Individual Components...\n');
  
  const generator = new DocumentationGenerator();
  
  // Test project structure gathering
  console.log('📁 Testing project structure gathering...');
  const structure = generator.getProjectStructure();
  console.log('✅ Project structure:', structure.split('\n').length, 'files found');
  
  // Test README reading
  console.log('📖 Testing README reading...');
  const readme = generator.readReadme();
  console.log('✅ README content:', readme.length, 'characters');
  
  // Test package info
  console.log('📦 Testing package info...');
  const packageInfo = generator.getPackageInfo();
  console.log('✅ Package info:', packageInfo.includes('commit-logger') ? 'Valid' : 'Basic info');
  
  // Test code analysis
  console.log('🔍 Testing code analysis...');
  const codeAnalysis = generator.performCodeAnalysis();
  console.log('✅ Code analysis:', codeAnalysis.length, 'characters');
  
  console.log('\n✅ All component tests passed!');
}

// Run tests based on command line arguments
if (process.argv.includes('--components-only')) {
  testComponents();
} else {
  testDocumentationGenerator();
} 