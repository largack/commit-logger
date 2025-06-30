#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Commit Logger Framework...\n');

const checks = [
  {
    name: 'Project Structure',
    validate: () => {
      const requiredFiles = [
        'package.json',
        'src/index.js',
        'src/commit-logger.js',
        'src/services/github-service.js',
        'src/services/openai-service.js',
        'src/services/sheets-service.js',
        '.github/workflows/commit-logger.yml',
        'env.example'
      ];
      
      const missing = requiredFiles.filter(file => !fs.existsSync(file));
      if (missing.length > 0) {
        throw new Error(`Missing files: ${missing.join(', ')}`);
      }
      return '✅ All required files present';
    }
  },
  {
    name: 'Package Dependencies',
    validate: () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredDeps = [
        'googleapis',
        'openai',
        'dotenv',
        '@actions/core',
        '@actions/github'
      ];
      
      const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
      if (missing.length > 0) {
        throw new Error(`Missing dependencies: ${missing.join(', ')}`);
      }
      return '✅ All dependencies installed';
    }
  },
  {
    name: 'Environment Template',
    validate: () => {
      const envExample = fs.readFileSync('env.example', 'utf8');
      const requiredVars = [
        'OPENAI_API_KEY',
        'GOOGLE_SHEETS_SPREADSHEET_ID',
        'GOOGLE_SERVICE_ACCOUNT_EMAIL',
        'GOOGLE_PRIVATE_KEY'
      ];
      
      const missing = requiredVars.filter(key => !envExample.includes(key));
      if (missing.length > 0) {
        throw new Error(`Missing env vars: ${missing.join(', ')}`);
      }
      return '✅ Environment template complete';
    }
  },
  {
    name: 'GitHub Workflow',
    validate: () => {
      const workflow = fs.readFileSync('.github/workflows/commit-logger.yml', 'utf8');
      
      // Check for required workflow components
      if (!workflow.includes('OPENAI_API_KEY')) {
        throw new Error('Missing OpenAI API key in workflow');
      }
      if (!workflow.includes('GOOGLE_SHEETS_SPREADSHEET_ID')) {
        throw new Error('Missing Google Sheets ID in workflow');
      }
      if (!workflow.includes('node src/index.js')) {
        throw new Error('Missing main script execution');
      }
      
      return '✅ GitHub workflow configured correctly';
    }
  },
  {
    name: 'Git Configuration',
    validate: () => {
      const { execSync } = require('child_process');
      try {
        const name = execSync('git config --get user.name', { encoding: 'utf8' }).trim();
        const email = execSync('git config --get user.email', { encoding: 'utf8' }).trim();
        
        if (!name || !email) {
          throw new Error('Git user not configured');
        }
        
        return `✅ Git configured (${name} <${email}>)`;
      } catch (error) {
        throw new Error('Git configuration missing');
      }
    }
  },
  {
    name: 'VS Code Settings',
    validate: () => {
      if (!fs.existsSync('.vscode/settings.json')) {
        return '⚠️  VS Code settings not found (optional)';
      }
      
      const settings = JSON.parse(fs.readFileSync('.vscode/settings.json', 'utf8'));
      if (!settings['git.user.name'] || !settings['git.user.email']) {
        return '⚠️  Git user not configured in VS Code settings';
      }
      
      return '✅ VS Code workspace configured';
    }
  },
  {
    name: 'Node.js Requirements',
    validate: () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 16) {
        throw new Error(`Node.js ${nodeVersion} detected. Requires Node.js 16+`);
      }
      
      return `✅ Node.js ${nodeVersion} (compatible)`;
    }
  }
];

let passed = 0;
let warnings = 0;

for (const check of checks) {
  try {
    const result = check.validate();
    console.log(`${check.name}: ${result}`);
    if (result.includes('⚠️')) {
      warnings++;
    } else {
      passed++;
    }
  } catch (error) {
    console.log(`${check.name}: ❌ ${error.message}`);
  }
}

console.log(`\n📊 Validation Results:`);
console.log(`✅ ${passed} checks passed`);
if (warnings > 0) {
  console.log(`⚠️  ${warnings} warnings`);
}

if (passed >= 5) {
  console.log(`\n🎉 Framework is ready! Your commit-logger is properly configured.`);
  console.log(`\n🔧 Next steps:`);
  console.log(`1. Configure your .env file with real API keys`);
  console.log(`2. Set up GitHub repository secrets`);
  console.log(`3. Push to GitHub to trigger the workflow`);
} else {
  console.log(`\n❌ Framework needs attention. Please fix the issues above.`);
} 