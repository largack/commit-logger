# GitHub Secrets Setup Guide

This guide walks you through setting up all the required secrets in your GitHub repository.

## Required Secrets

### 1. OPENAI_API_KEY
Your OpenAI API key for generating commit explanations.

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Add to GitHub:**
- Repository Settings → Secrets and variables → Actions
- Click "New repository secret"
- Name: `OPENAI_API_KEY`
- Value: Your OpenAI API key

### 2. GOOGLE_SHEETS_SPREADSHEET_ID
The ID of your Google Sheet where commits will be logged.

**How to get it:**
1. Create or open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit`
3. Copy the ID part between `/d/` and `/edit`

**Add to GitHub:**
- Name: `GOOGLE_SHEETS_SPREADSHEET_ID`
- Value: Your sheet ID (just the ID, not the full URL)

### 3. GOOGLE_SERVICE_ACCOUNT_EMAIL
The email address of your Google Cloud service account.

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "IAM & Admin" → "Service Accounts"
4. Find your service account
5. Copy the email (looks like `name@project.iam.gserviceaccount.com`)

**Add to GitHub:**
- Name: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- Value: The service account email

### 4. GOOGLE_PRIVATE_KEY
The private key from your Google Cloud service account.

**How to get it:**
1. In Google Cloud Console → "Service Accounts"
2. Click on your service account
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key" → "JSON"
5. Download the JSON file
6. Open the file and copy the `private_key` value (including the quotes and `\n` characters)

**Add to GitHub:**
- Name: `GOOGLE_PRIVATE_KEY`
- Value: The entire private key string, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

⚠️ **Important:** Make sure to include the full key with all the `\n` characters exactly as they appear in the JSON file.

## Setting Up Google Cloud Service Account

### Step-by-Step Instructions

1. **Create a Google Cloud Project**
   ```
   1. Go to Google Cloud Console
   2. Click "Select a project" → "New Project"
   3. Name your project (e.g., "commit-logger")
   4. Click "Create"
   ```

2. **Enable Google Sheets API**
   ```
   1. In the console, go to "APIs & Services" → "Library"
   2. Search for "Google Sheets API"
   3. Click on it and press "Enable"
   ```

3. **Create Service Account**
   ```
   1. Go to "IAM & Admin" → "Service Accounts"
   2. Click "Create Service Account"
   3. Name: "commit-logger-service"
   4. Description: "Service account for automated commit logging"
   5. Click "Create and Continue"
   6. Skip role assignment (click "Continue")
   7. Click "Done"
   ```

4. **Generate Key**
   ```
   1. Click on the created service account
   2. Go to "Keys" tab
   3. Click "Add Key" → "Create new key"
   4. Select "JSON" format
   5. Click "Create" - this downloads the key file
   ```

5. **Share Google Sheet**
   ```
   1. Open your Google Sheet
   2. Click "Share" button
   3. Add the service account email
   4. Give "Editor" permission
   5. Uncheck "Notify people"
   6. Click "Share"
   ```

## Verifying Your Setup

After adding all secrets, you can verify they're set correctly:

1. Go to your repository settings
2. Click "Secrets and variables" → "Actions"
3. You should see all 4 secrets listed:
   - ✅ OPENAI_API_KEY
   - ✅ GOOGLE_SHEETS_SPREADSHEET_ID
   - ✅ GOOGLE_SERVICE_ACCOUNT_EMAIL
   - ✅ GOOGLE_PRIVATE_KEY

## Testing the Setup

1. **Make a test commit:**
   ```bash
   git add .
   git commit -m "Test commit for commit logger"
   git push
   ```

2. **Check GitHub Actions:**
   - Go to your repository → "Actions" tab
   - Look for the "Commit Logger" workflow
   - Check if it runs successfully

3. **Verify Google Sheet:**
   - Open your Google Sheet
   - Look for a new row with your commit data
   - Check that the AI explanation was generated

## Common Issues

### "Spreadsheet not found"
- Verify the sheet ID is correct
- Make sure you shared the sheet with the service account email
- Check that the service account has "Editor" permissions

### "Invalid credentials"
- Verify all secrets are set correctly
- Check that the private key includes the full key with headers
- Make sure there are no extra spaces in the secret values

### "OpenAI quota exceeded"
- Check your OpenAI billing and usage
- Consider using GPT-3.5-turbo instead of GPT-4 for lower costs

### "GitHub token permissions"
- The default `GITHUB_TOKEN` should work for most repositories
- If issues persist, create a personal access token with repo permissions

## Security Best Practices

1. **Never commit secrets to your repository**
2. **Use GitHub Secrets for all sensitive data**
3. **Regularly rotate your API keys**
4. **Limit service account permissions to only what's needed**
5. **Monitor usage of your API keys**

## Optional: Environment Variables

You can also set these as repository variables (not secrets) for non-sensitive configuration:

- `SHEET_NAME`: Name of the sheet tab (default: "CommitLog")
- `LOG_LEVEL`: Logging level (default: "info", options: "debug", "info", "warn", "error") 