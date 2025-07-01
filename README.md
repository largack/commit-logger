# Commit Logger 📊

An automated framework that logs Git commits to Google Sheets with AI-powered explanations using OpenAI's GPT models. Triggered by GitHub Actions on every commit.

## Features

- 🤖 **AI-Powered Explanations**: Uses OpenAI GPT-4 to analyze and explain code changes
- 📋 **Google Sheets Integration**: Automatically logs commit data to a spreadsheet
- ⚡ **GitHub Actions Automation**: Triggers on every push/PR merge
- 📝 **Manual Documentation Generation**: On-demand AI documentation with customizable prompts
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

## Documentation Generation

### Manual Documentation Creation

The framework includes a powerful documentation generator that can create comprehensive project documentation on-demand using AI.

#### Using the GitHub Actions Workflow

1. Go to your repository's **Actions** tab
2. Select **Documentation Generator** workflow
3. Click **Run workflow**
4. Fill in the form:
   - **Documentation prompt template**: Customize what you want documented
   - **Documentation type**: Choose from General, API Reference, User Guide, etc.
   - **Include code analysis**: Whether to analyze the codebase
   - **Output format**: Structured, Markdown, Technical Spec, or User Manual

#### Available Documentation Types

- **General**: Complete project overview for all audiences
- **API Reference**: Detailed API documentation with examples
- **User Guide**: Step-by-step user instructions
- **Developer Guide**: Technical implementation details
- **Troubleshooting**: Problem-solution oriented documentation
- **Architecture**: System design and technical decisions
- **Custom**: Use your own specific requirements

#### Example Usage

```bash
# Local testing of documentation generator
node scripts/test-documentation-generator.js

# Manual command line usage
node src/documentation-generator.js \
  --prompt="Generate API documentation with examples" \
  --type="API Reference" \
  --include-code="true" \
  --format="Markdown" \
  --repository="my-project" \
  --triggered-by="username"
```

#### Documentation Sheet

All generated documentation is logged to a **Documentation** sheet in your Google Sheets with:

- Timestamp and repository info
- Documentation type and format
- Custom prompt used
- Generated content (full documentation)
- Word count and generation time
- Status and metadata

This allows you to:
- Track documentation history
- Compare different documentation approaches
- Maintain versioned documentation
- Share AI-generated docs with your team

## Project Structure

```
commit-logger/
├── .github/workflows/
│   ├── commit-logger.yml               # Automatic commit logging
│   ├── merge-logger.yml                # PR merge tracking  
│   └── documentation-generator.yml     # Manual documentation generation
├── src/
│   ├── index.js                        # Main entry point
│   ├── commit-logger.js                # Core commit orchestrator
│   ├── merge-logger.js                 # Merge request handler
│   ├── documentation-generator.js      # AI documentation generator
│   └── services/
│       ├── github-service.js           # GitHub API integration
│       ├── openai-service.js           # OpenAI API integration
│       └── sheets-service.js           # Google Sheets API integration
├── scripts/
│   ├── test-local.js                   # Local testing suite
│   ├── test-merge-logger.js            # Merge logger testing
│   └── test-documentation-generator.js # Documentation testing
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

## Architecture & Workflows

### System Architecture

```mermaid
graph TB
    A[GitHub Repository] --> B[GitHub Actions]
    B --> C{Event Type}
    
    C -->|Push to main/dev| D[Commit Logger Workflow]
    C -->|PR Merge| E[Merge Request Logger Workflow]
    
    D --> F[Fetch Commit Data]
    E --> G[Fetch PR Data]
    
    F --> H[GitHub Service]
    G --> H
    
    H --> I[OpenAI Service]
    I --> J[Generate AI Explanation]
    
    J --> K[Google Sheets Service]
    K --> L[Log to Spreadsheet]
    
    L --> M{Sheet Type}
    M -->|Commits| N[CommitLog Sheet]
    M -->|Merges| O[MergeRequests Sheet]
    
    subgraph "External APIs"
        P[GitHub API]
        Q[OpenAI GPT-4 API]
        R[Google Sheets API]
    end
    
    H -.-> P
    I -.-> Q
    K -.-> R
```

### Commit Logger Workflow

```mermaid
sequenceDiagram
    participant GH as GitHub
    participant GA as GitHub Actions
    participant CL as Commit Logger
    participant GS as GitHub Service
    participant OS as OpenAI Service
    participant SS as Sheets Service
    participant Sheet as Google Sheets
    
    GH->>GA: Push to main/dev branch
    GA->>CL: Trigger commit-logger.yml
    CL->>GS: Fetch commit details
    GS->>GH: API call for commit data
    GH-->>GS: Return commit info
    GS-->>CL: Commit data (files, changes, etc.)
    
    CL->>OS: Generate explanation
    OS->>OpenAI: Analyze code changes
    OpenAI-->>OS: AI explanation
    OS-->>CL: Formatted explanation
    
    CL->>SS: Prepare log entry
    SS->>Sheet: Write to CommitLog sheet
    Sheet-->>SS: Confirmation
    SS-->>CL: Success
    
    CL->>GA: Log completion status
```

### Merge Request Logger Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant PR as Pull Request
    participant GA as GitHub Actions
    participant ML as Merge Logger
    participant GS as GitHub Service
    participant OS as OpenAI Service
    participant SS as Sheets Service
    participant Sheet as Google Sheets
    
    Dev->>PR: Create & merge PR
    PR->>GA: Trigger merge-logger.yml
    GA->>ML: Execute merge workflow
    
    ML->>GS: Fetch PR details
    GS->>GitHub: Get PR metadata
    GitHub-->>GS: PR info (title, branch, files)
    GS-->>ML: Structured PR data
    
    ML->>ML: Categorize by branch name
    Note over ML: feature/* = Feature<br/>hotfix/* = Hotfix<br/>other = Other
    
    ML->>OS: Generate merge summary
    OS->>OpenAI: Analyze PR changes
    OpenAI-->>OS: AI summary
    OS-->>ML: Merge explanation
    
    ML->>SS: Log merge request
    SS->>Sheet: Write to MergeRequests sheet
    Sheet-->>SS: Success confirmation
    SS-->>ML: Logged successfully
    
    ML->>GA: Complete workflow
```

### Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Data Sources"
        A[Git Commits]
        B[Pull Requests]
        C[Branch Names]
        D[File Changes]
    end
    
    subgraph "Processing Layer"
        E[GitHub Service]
        F[OpenAI Service]
        G[Classification Logic]
    end
    
    subgraph "Storage Layer"
        H[Google Sheets]
        I[CommitLog Sheet]
        J[MergeRequests Sheet]
    end
    
    subgraph "Output"
        K[Commit Tracking]
        L[Merge Analytics]
        M[AI Insights]
    end
    
    A --> E
    B --> E
    C --> G
    D --> E
    
    E --> F
    G --> F
    F --> H
    
    H --> I
    H --> J
    
    I --> K
    J --> L
    F --> M
```

## Proposed Improvements

### 1. 🔄 **Real-time Collaboration Metrics**
**Enhancement**: Add team collaboration insights by tracking:
- Code reviewer assignments and response times
- Cross-team contributions and knowledge sharing
- Commit frequency patterns and developer productivity metrics
- Integration with Slack/Teams for real-time notifications

**Implementation**: Extend GitHub Service to fetch PR review data, add new sheet columns for collaboration metrics, and create webhook endpoints for real-time updates.

### 2. 🧪 **Automated Testing Integration**
**Enhancement**: Integrate with CI/CD pipelines to capture:
- Test coverage changes per commit
- Build success/failure rates
- Performance benchmarks and regression detection
- Automated quality gates and alerts

**Implementation**: Add CI service integration, extend workflow to capture test results, create performance tracking dashboard, and implement automated quality notifications.

### 3. 🎯 **Smart Code Quality Analysis**
**Enhancement**: Implement intelligent code quality scoring:
- Static analysis integration (ESLint, SonarQube)
- Technical debt tracking and trend analysis
- Code complexity metrics and maintainability scores
- Automated refactoring suggestions from AI

**Implementation**: Integrate static analysis tools, create quality scoring algorithms, add trend visualization, and enhance OpenAI prompts for refactoring suggestions.

### 4. 📊 **Advanced Analytics Dashboard**
**Enhancement**: Create a comprehensive analytics interface:
- Interactive charts for commit patterns and team velocity
- Predictive analytics for project timeline estimation
- Risk assessment based on code complexity and change frequency
- Custom reporting with exportable insights

**Implementation**: Build React/Vue dashboard, implement data visualization libraries, create predictive models, and add export functionality with scheduled reports.

### 5. 🔐 **Enhanced Security & Compliance**
**Enhancement**: Strengthen security and add compliance features:
- Automated security vulnerability scanning per commit
- Compliance tracking for regulatory requirements (SOX, GDPR)
- Audit trail with immutable logging
- Role-based access control for different data sensitivity levels

**Implementation**: Integrate security scanning tools, add compliance frameworks, implement blockchain-based audit trails, and create granular permission systems.

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

Testing version 1.0.4
Change: Commit Logger worked for the first time.
Update: Testing merge logger with proper GitHub Actions permissions fix.
Enhancement: Added streamlined PR template with Linear integration.