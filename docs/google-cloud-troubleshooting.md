# Google Cloud Troubleshooting Guide

Your service account is configured as: `commit-logger@acidlabs-51ffd.iam.gserviceaccount.com`
Your project appears to be: `acidlabs-51ffd`

## 🔧 Step-by-Step Fix

### 1. Enable Google Sheets API

**Go to:** [Google Sheets API - acidlabs-51ffd](https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=acidlabs-51ffd)

1. Make sure you're in the correct project: `acidlabs-51ffd`
2. Click **"ENABLE"** if the API is not enabled
3. If already enabled, you should see "API enabled" ✅

### 2. Verify Service Account Exists

**Go to:** [Service Accounts - acidlabs-51ffd](https://console.cloud.google.com/iam-admin/serviceaccounts?project=acidlabs-51ffd)

1. Look for: `commit-logger@acidlabs-51ffd.iam.gserviceaccount.com`
2. If it doesn't exist, you need to create it:
   - Click **"CREATE SERVICE ACCOUNT"**
   - Name: `commit-logger`
   - Service account ID: `commit-logger` 
   - Description: `Service account for commit logger automation`
   - Click **"CREATE AND CONTINUE"**
   - Skip role assignment for now
   - Click **"DONE"**

### 3. Generate New Service Account Key

1. Click on the `commit-logger` service account
2. Go to the **"KEYS"** tab
3. Click **"ADD KEY"** → **"Create new key"**
4. Choose **"JSON"** format
5. Click **"CREATE"** - this downloads a new JSON file
6. **IMPORTANT**: Use this NEW JSON file for your credentials

### 4. Update Your Credentials

From the downloaded JSON file, copy these values:

```json
{
  "type": "service_account",
  "project_id": "acidlabs-51ffd",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "commit-logger@acidlabs-51ffd.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Update your `.env` file:**
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=commit-logger@acidlabs-51ffd.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Update your GitHub Secrets:**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: `commit-logger@acidlabs-51ffd.iam.gserviceaccount.com`
- `GOOGLE_PRIVATE_KEY`: Copy the entire `private_key` value from JSON (with all `\n` characters)

### 5. Share Google Sheet with Service Account

**Go to your Google Sheet:**
[Your Spreadsheet](https://docs.google.com/spreadsheets/d/16OtIENH95uZt7_nwTGeSMgcJNp6B314lJprz126f0oE/edit)

1. Click **"Share"** (top right)
2. Add email: `commit-logger@acidlabs-51ffd.iam.gserviceaccount.com`
3. Set permission: **"Editor"**
4. **Uncheck** "Notify people"
5. Click **"Share"**

### 6. Test the Connection

After completing the above steps:

```bash
npm run test-google
```

## 🚨 Common Issues

### Issue 1: Wrong Project
- Make sure you're working in project `acidlabs-51ffd`
- Check the project selector in the top bar of Google Cloud Console

### Issue 2: API Not Enabled
- Google Sheets API must be enabled
- Also enable Google Drive API if you plan to create sheets programmatically

### Issue 3: Malformed Private Key
- The private key must include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- All `\n` characters must be preserved exactly as in the JSON
- Don't add extra quotes when copying to GitHub Secrets

### Issue 4: Service Account Permissions
- The service account needs access to Google Sheets API
- Your Google Sheet must be explicitly shared with the service account email

## 🎯 Quick Fix Commands

After following the steps above, test locally:

```bash
# Debug configuration
npm run debug-google

# Test Google connection
npm run test-google

# If successful, test full commit logger
npm run test-local
```

## 📞 If Still Not Working

If you continue to get "Invalid Credentials" after following all steps:

1. **Create a completely new service account** with a different name
2. **Download a fresh JSON key**
3. **Make sure you're in the right Google Cloud project**
4. **Double-check that Google Sheets API is enabled**

The error "Invalid Credentials" specifically means Google can't authenticate your service account, so the issue is definitely in the Google Cloud setup, not in your code. 