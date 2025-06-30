# Commit Logger 📊

An automated framework that logs Git commits to Google Sheets with AI-powered explanations using OpenAI's GPT models. Triggered by GitHub Actions on every commit.

## Features

- 🤖 **AI-Powered Explanations**: Uses OpenAI GPT-4 to analyze and explain code changes
- 📋 **Google Sheets Integration**: Automatically logs commit data to a spreadsheet
- ⚡ **GitHub Actions Automation**: Triggers on every push/PR merge
- 🔐 **Secure Configuration**: Uses GitHub Secrets for API keys
- 📈 **Rich Commit Data**: Tracks author, files changed, lines added/deleted, and more

## Setup Guide

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd commit-logger
npm install
```

### 2. Configure Environment Variables

Copy `env.example` to `.env` and fill in your API keys:

```bash
cp env.example .env
# or use the setup script
npm run setup
```

### 3. Set up Google Sheets API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Download the JSON key file
5. Share your Google Sheet with the service account email
6. Copy the required values to your environment variables

### 4. Set up OpenAI API

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your environment variables

### 5. Configure GitHub Secrets

In your GitHub repository settings, add these secrets:

- `OPENAI_API_KEY`: Your OpenAI API key
- `GOOGLE_SHEETS_SPREADSHEET_ID`: Your Google Sheets ID (from the URL)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
- `GOOGLE_PRIVATE_KEY`: Private key from service account JSON (include the full key with `-----BEGIN PRIVATE KEY-----` headers)

### 6. Create Your Google Sheet

Create a new Google Sheet and note the ID from the URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
```

The sheet will automatically be set up with headers when the first commit is processed.

## Usage

Once configured, the system automatically:

1. **Triggers** on commits to main/master/develop branches
2. **Analyzes** the commit using GitHub API
3. **Explains** changes using OpenAI GPT-4
4. **Logs** everything to your Google Sheet

### Manual Testing

You can test the logger setup and connections:

```bash
# Set up your .env file first
npm run test-local
```

Or run the full commit logger (requires GitHub environment variables):

```bash
npm start
```

## Project Structure

```
commit-logger/
├── .github/workflows/commit-logger.yml  # GitHub Actions workflow
├── src/
│   ├── index.js                        # Main entry point
│   ├── commit-logger.js                # Core orchestrator
│   └── services/
│       ├── github-service.js           # GitHub API integration
│       ├── openai-service.js           # OpenAI API integration
│       └── sheets-service.js           # Google Sheets API integration
├── .env.example                        # Environment variables template
├── package.json                        # Dependencies
└── README.md                          # This file
```

## Spreadsheet Columns

The Google Sheet will contain these columns:

| Column | Description |
|--------|-------------|
| Timestamp | When the commit was processed |
| Repository | GitHub repository name |
| Branch | Git branch name |
| Commit SHA | Short commit hash |
| Author | Commit author |
| Commit Message | Original commit message |
| Files Changed | Number of files modified |
| Lines Added | Lines of code added |
| Lines Deleted | Lines of code deleted |
| AI Explanation | GPT-4 generated explanation |
| Commit URL | Direct link to GitHub commit |

## Customization

### Changing the AI Model

Edit `src/services/openai-service.js` to use a different model:

```javascript
model: "gpt-3.5-turbo", // or "gpt-4-turbo", etc.
```

### Modifying Trigger Conditions

Edit `.github/workflows/commit-logger.yml` to change when the action runs:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]  # Add more branches
```

### Adding More Data

Extend the `CommitLogger` class to capture additional metadata like:
- PR information
- Code review comments
- Build status
- Test coverage changes

## Troubleshooting

### Common Issues

1. **"Spreadsheet not found"**: Ensure the service account has access to your sheet
2. **"OpenAI quota exceeded"**: Check your OpenAI billing and usage limits  
3. **"GitHub token permissions"**: Ensure `GITHUB_TOKEN` has repository read access

### Debug Mode

Enable verbose logging by setting `LOG_LEVEL=debug` in your environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Projects

- [OpenAI Codex](https://github.com/openai/codex) - The inspiration for this project's AI integration
- [Google Sheets API](https://developers.google.com/sheets/api) - Documentation for the Sheets integration

---

**Happy coding!** 🚀 Your commits will now be automatically logged and explained. 

Testing version 1.0.1
Change: I have shared the sheet to our service email.