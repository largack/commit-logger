#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ACCOUNT_CONFIGS = {
  work: {
    name: 'Your Work Name',
    email: 'work@company.com',
    ghUser: 'work-username'
  },
  personal: {
    name: 'tataknu',
    email: 'cf.vildosolam@gmail.com',
    ghUser: 'tataknu'
  },
  largack: {
    name: 'largack',
    email: 'largack@company.com',
    ghUser: 'largack'
  }
};

function setupAccount(accountType) {
  const config = ACCOUNT_CONFIGS[accountType];
  if (!config) {
    console.error(`❌ Unknown account type: ${accountType}`);
    console.log('Available accounts:', Object.keys(ACCOUNT_CONFIGS).join(', '));
    process.exit(1);
  }

  try {
    console.log(`🔧 Setting up ${accountType} account...`);
    
    // Set git config
    execSync(`git config user.name "${config.name}"`);
    execSync(`git config user.email "${config.email}"`);
    
    // Switch GitHub CLI if available
    try {
      execSync(`gh auth switch --hostname github.com --user ${config.ghUser}`, 
               { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  GitHub CLI not available or account not configured');
    }
    
    // Update VS Code settings
    const vscodeDir = '.vscode';
    const settingsFile = path.join(vscodeDir, 'settings.json');
    
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir);
    }
    
    let settings = {};
    if (fs.existsSync(settingsFile)) {
      settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    }
    
    // Update git settings
    settings['git.user.name'] = config.name;
    settings['git.user.email'] = config.email;
    settings['github.gitAuthentication'] = true;
    
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    
    console.log(`✅ Configured workspace for ${accountType} account`);
    console.log(`   Name: ${config.name}`);
    console.log(`   Email: ${config.email}`);
    console.log(`   GitHub User: ${config.ghUser}`);
    
    // Verify the configuration
    const currentName = execSync('git config --get user.name', { encoding: 'utf8' }).trim();
    const currentEmail = execSync('git config --get user.email', { encoding: 'utf8' }).trim();
    
    console.log(`\n🔍 Verification:`);
    console.log(`   Current git name: ${currentName}`);
    console.log(`   Current git email: ${currentEmail}`);
    
    if (currentName === config.name && currentEmail === config.email) {
      console.log('✅ Configuration verified successfully!');
    } else {
      console.log('⚠️  Configuration might not have applied correctly');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Get account type from command line
const accountType = process.argv[2];
if (!accountType) {
  console.log('🚀 GitHub Account Setup for Commit Logger');
  console.log('\nUsage: node scripts/setup-github-account.js [account-type]');
  console.log('\nAvailable accounts:');
  Object.keys(ACCOUNT_CONFIGS).forEach(key => {
    const config = ACCOUNT_CONFIGS[key];
    console.log(`  ${key}: ${config.name} <${config.email}>`);
  });
  console.log('\nExample: node scripts/setup-github-account.js personal');
  process.exit(1);
}

setupAccount(accountType); 