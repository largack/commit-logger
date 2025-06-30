#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Commit Logger...\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from env.example');
  } else {
    console.log('❌ env.example file not found');
  }
} else {
  console.log('ℹ️ .env file already exists');
}

console.log('\n📋 Setup Checklist:');
console.log('1. ✅ Project structure created');
console.log('2. ⚠️  Configure .env file with your API keys');
console.log('3. ⚠️  Set up Google Sheets API credentials');
console.log('4. ⚠️  Get OpenAI API key');
console.log('5. ⚠️  Configure GitHub repository secrets');

console.log('\n🔧 Next Steps:');
console.log('1. Edit .env file with your actual API keys');
console.log('2. Run: npm install');
console.log('3. Test with: npm start');
console.log('4. Push to GitHub to trigger actions');

console.log('\n📚 See README.md for detailed setup instructions'); 