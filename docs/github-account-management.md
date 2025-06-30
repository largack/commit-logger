# Managing Multiple GitHub Accounts in VS Code

This guide shows you how to automatically use the correct GitHub account based on your workspace.

## Method 1: Workspace-Specific Git Configuration (Recommended)

### Step 1: Configure Git Per Repository
```bash
# Navigate to your repository
cd /path/to/your/project

# Set git user for this specific repository
git config user.name "Your Work Name"
git config user.email "work@company.com"

# Verify the configuration
git config --get user.name
git config --get user.email
```

### Step 2: VS Code Workspace Settings
Create `.vscode/settings.json` in your project root:
```json
{
  "git.user.name": "Your Work Name",
  "git.user.email": "work@company.com",
  "github.gitAuthentication": true
}
```

## Method 2: SSH Keys for Different Accounts

### Step 1: Generate SSH Keys
```bash
# Personal account key
ssh-keygen -t ed25519 -C "personal@email.com" -f ~/.ssh/id_ed25519_personal

# Work account key  
ssh-keygen -t ed25519 -C "work@company.com" -f ~/.ssh/id_ed25519_work
```

### Step 2: Add Keys to SSH Agent
```bash
ssh-add ~/.ssh/id_ed25519_personal
ssh-add ~/.ssh/id_ed25519_work
```

### Step 3: Configure SSH Config
Edit `~/.ssh/config`:
```
# Personal GitHub
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    AddKeysToAgent yes

# Work GitHub
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    AddKeysToAgent yes
```

### Step 4: Clone with Specific Host
```bash
# Personal projects
git clone git@github-personal:username/repo.git

# Work projects
git clone git@github-work:company/repo.git
```

### Step 5: Configure Remote for Existing Repos
```bash
# Change remote to use work account
git remote set-url origin git@github-work:company/repo.git

# Or for personal account
git remote set-url origin git@github-personal:username/repo.git
```

## Method 3: GitHub CLI with Multiple Accounts

### Step 1: Install GitHub CLI
```bash
# macOS
brew install gh

# Or download from https://cli.github.com/
```

### Step 2: Login to Multiple Accounts
```bash
# Login to first account
gh auth login -h github.com

# Login to second account (will be added)
gh auth login -h github.com --web
```

### Step 3: Switch Accounts
```bash
# List available accounts
gh auth status

# Switch accounts
gh auth switch --hostname github.com --user work-username
```

### Step 4: Workspace-Specific Scripts
Create a script in your project root:

**`.github-setup.sh`:**
```bash
#!/bin/bash
# Automatically configure GitHub account for this workspace

# Set git config for this repository
git config user.name "Work Name"
git config user.email "work@company.com"

# Switch GitHub CLI to work account
gh auth switch --hostname github.com --user work-username

echo "✅ Configured workspace for work account"
```

Make it executable and run:
```bash
chmod +x .github-setup.sh
./.github-setup.sh
```

## Method 4: VS Code Extensions

### GitHub Pull Requests Extension
1. Install "GitHub Pull Requests and Issues" extension
2. Go to Command Palette (`Cmd+Shift+P`)
3. Run "GitHub: Sign in"
4. You can sign in to multiple accounts

### GitLens Extension Configuration
Add to workspace settings:
```json
{
  "gitlens.gitCommands.closeOnFocusOut": true,
  "gitlens.defaultDateFormat": "MMMM Do, YYYY h:mma",
  "git.user.name": "Work Name",
  "git.user.email": "work@company.com"
}
```

## Method 5: Automated Setup with Scripts

### Create a Project Setup Script
**`scripts/setup-github-account.js`:**
```javascript
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
    name: 'Your Personal Name', 
    email: 'personal@email.com',
    ghUser: 'personal-username'
  }
};

function setupAccount(accountType) {
  const config = ACCOUNT_CONFIGS[accountType];
  if (!config) {
    console.error(`Unknown account type: ${accountType}`);
    process.exit(1);
  }

  try {
    // Set git config
    execSync(`git config user.name "${config.name}"`);
    execSync(`git config user.email "${config.email}"`);
    
    // Switch GitHub CLI
    execSync(`gh auth switch --hostname github.com --user ${config.ghUser}`, 
             { stdio: 'inherit' });
    
    // Update VS Code settings
    const vscodeDir = '.vscode';
    const settingsFile = path.join(vscodeDir, 'settings.json');
    
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir);
    }
    
    const settings = {
      "git.user.name": config.name,
      "git.user.email": config.email,
      "github.gitAuthentication": true
    };
    
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    
    console.log(`✅ Configured workspace for ${accountType} account`);
    console.log(`   Name: ${config.name}`);
    console.log(`   Email: ${config.email}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Get account type from command line
const accountType = process.argv[2];
if (!accountType) {
  console.log('Usage: node scripts/setup-github-account.js [work|personal]');
  process.exit(1);
}

setupAccount(accountType);
```

### Add Script to package.json
```json
{
  "scripts": {
    "github:work": "node scripts/setup-github-account.js work",
    "github:personal": "node scripts/setup-github-account.js personal"
  }
}
```

### Use the Script
```bash
# Setup for work account
npm run github:work

# Setup for personal account  
npm run github:personal
```

## Quick Setup for This Project

For your commit-logger project, run these commands:

```bash
# Configure git for this repository
git config user.name "Your Name"
git config user.email "your-email@domain.com"

# If using SSH, set the remote URL
git remote set-url origin git@github-work:yourusername/commit-logger.git

# Switch GitHub CLI account if needed
gh auth switch --hostname github.com --user yourusername
```

## Pro Tips

1. **Use different SSH keys** - Most reliable method
2. **Workspace settings override global settings** - Perfect for VS Code
3. **Create setup scripts** - Automate the switching process
4. **Use meaningful SSH host aliases** - `github-work`, `github-personal`
5. **Verify your setup** - Always check `git config --get user.email`

## Troubleshooting

### Check Current Configuration
```bash
# Check current git config
git config --get user.name
git config --get user.email

# Check GitHub CLI status
gh auth status

# Check SSH connections
ssh -T git@github.com
```

### Reset Configuration
```bash
# Remove workspace git config
git config --unset user.name
git config --unset user.email

# Use global config instead
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

Choose the method that works best for your workflow! The SSH key method is most reliable for automatic switching, while workspace settings are great for VS Code-specific configuration. 