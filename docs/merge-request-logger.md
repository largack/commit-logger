# Merge Request Logger 🔀

Automatically logs pull request merges to Google Sheets with AI-powered analysis and branch type categorization.

## 🎯 Features

- **🔍 Automatic PR Detection**: Triggers when PRs are merged to main/master
- **🏷️ Smart Categorization**: Classifies PRs based on branch naming patterns
- **🤖 AI Analysis**: GPT-4 powered analysis of PR changes and impact
- **📊 Separate Tracking**: Logs to dedicated "Merge Request" sheet
- **🔄 Branch Flow Insights**: Track your development workflow patterns

## 📋 Branch Type Classification

The system automatically categorizes PRs based on source branch names:

| Branch Pattern | Type | Description |
|----------------|------|-------------|
| `feature/*` | Feature | New features and enhancements |
| `hotfix/*` | Hotfix | Critical production fixes |
| `bugfix/*` or `fix/*` | Bugfix | General bug fixes |
| `chore/*` | Chore | Maintenance, dependencies, tooling |
| `docs/*` | Documentation | Documentation updates |
| `refactor/*` | Refactor | Code restructuring without new features |
| Other patterns | Other | Anything that doesn't match above |

## 📊 Google Sheets Structure

The "Merge Request" sheet contains these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Timestamp | When the PR was merged | 2024-01-15T14:30:00Z |
| Repository | GitHub repository name | largack/commit-logger |
| PR Number | Pull request number | #123 |
| Title | PR title | Add user authentication |
| Type | Classified type | Feature |
| Source Branch | Branch being merged | feature/user-auth |
| Target Branch | Destination branch | main |
| Author | PR author | jane-dev |
| Merged By | Who merged the PR | john-reviewer |
| Merged At | Merge timestamp | 2024-01-15T14:25:00Z |
| Files Changed | Number of files modified | 8 |
| Lines Added | Lines of code added | 245 |
| Lines Deleted | Lines of code removed | 67 |
| Commits | Number of commits in PR | 5 |
| AI Analysis | GPT-4 analysis of changes | This PR implements JWT authentication... |
| PR URL | Direct link to GitHub PR | https://github.com/... |

## 🔧 How It Works

### 1. Trigger Conditions
```yaml
on:
  pull_request:
    branches: [ main, master ]
    types: [ closed ]

jobs:
  log-merge:
    if: github.event.pull_request.merged == true
```

The workflow only runs when:
- PR targets `main` or `master` branch
- PR is actually **merged** (not just closed)

### 2. Data Collection
- Fetches PR metadata from GitHub API
- Analyzes file changes and commits
- Determines PR type from branch name
- Collects merge information

### 3. AI Analysis
- Sends PR data to OpenAI GPT-4
- Analyzes business impact and technical significance
- Generates comprehensive change summary
- Focuses on feature value and implementation details

### 4. Google Sheets Logging
- Automatically creates "Merge Request" sheet if needed
- Sets up headers on first run
- Appends merge data as new rows
- Handles retries for reliability

## 🚀 Usage Examples

### Feature PR
```
Branch: feature/user-dashboard
Type: Feature
AI Analysis: "This PR introduces a comprehensive user dashboard with 
real-time analytics, improving user engagement and providing valuable 
insights. The implementation uses React hooks and Chart.js for 
responsive data visualization."
```

### Hotfix PR
```
Branch: hotfix/security-patch
Type: Hotfix  
AI Analysis: "Critical security patch addressing SQL injection 
vulnerability in user authentication. Implements parameterized queries 
and input validation, resolving potential data exposure risk."
```

### Documentation PR
```
Branch: docs/api-examples
Type: Documentation
AI Analysis: "Updates API documentation with comprehensive examples 
and improved error handling guidance. Enhances developer experience 
and reduces integration time for new users."
```

## 📈 Analytics & Insights

With merge request data, you can analyze:

### Development Velocity
- PRs merged per week/month
- Time between PR creation and merge
- Feature delivery frequency

### Team Patterns
- Most active contributors
- Review and merge patterns
- Branch naming compliance

### Project Health
- Feature vs bugfix ratio
- Hotfix frequency (potential quality indicator)
- Documentation update frequency

### Code Quality Trends
- Average files changed per PR
- Code churn analysis
- Commit granularity patterns

## 🛠️ Configuration

### Environment Variables
The merge logger uses the same secrets as the commit logger:
- `OPENAI_API_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

### Customization Options

#### Branch Type Rules
Modify `determinePRType()` in `src/services/github-service.js`:
```javascript
determinePRType(branchName) {
  if (branchName.startsWith('epic/')) {
    return 'Epic';
  }
  // Add your custom rules here
}
```

#### AI Analysis Prompt
Customize the analysis in `src/services/openai-service.js`:
```javascript
buildMergeRequestAnalysisPrompt(prData) {
  // Modify the prompt to focus on specific aspects
}
```

#### Additional Data Points
Extend the row data in `src/merge-request-logger.js`:
```javascript
const rowData = {
  // ... existing fields
  labels: prData.labels.join(', '),
  reviewers: prData.reviewers.join(', '),
  // Add more fields as needed
};
```

## 🧪 Testing

Test the merge logger locally:
```bash
npm run test-merge
```

This validates:
- Branch type classification
- Google Sheets connection
- Sheet creation and headers

## 🔄 Workflow Integration

The merge request logger works alongside the commit logger:

- **Commit Logger**: Tracks individual commits and their changes
- **Merge Logger**: Tracks completed features and PR-level changes

Together, they provide complete visibility into your development process:
- Individual developer productivity (commits)
- Feature delivery tracking (merges)
- Code quality and review patterns
- Project velocity and health metrics

## 🚨 Troubleshooting

### Common Issues

**Workflow not triggering:**
- Ensure PR targets `main` or `master`
- Verify PR was merged (not just closed)
- Check GitHub Actions permissions

**Missing data in sheets:**
- Verify all GitHub secrets are configured
- Check Google Sheets sharing permissions
- Review GitHub Actions logs for errors

**Incorrect branch categorization:**
- Review branch naming conventions
- Update `determinePRType()` logic if needed
- Consider team guidelines for branch names

### Debug Commands
```bash
# Test components
npm run test-merge

# Check Google Sheets connection
npm run test-google

# Validate configuration
npm run validate
```

## 📊 Sample Dashboard Queries

### Weekly Feature Delivery
```sql
SELECT 
  WEEKOFYEAR(Timestamp) as Week,
  COUNT(*) as PRs_Merged,
  SUM(CASE WHEN Type = 'Feature' THEN 1 ELSE 0 END) as Features,
  SUM(CASE WHEN Type = 'Hotfix' THEN 1 ELSE 0 END) as Hotfixes
FROM MergeRequest 
GROUP BY Week
```

### Top Contributors
```sql
SELECT 
  Author,
  COUNT(*) as PRs_Merged,
  AVG(Files_Changed) as Avg_Files,
  SUM(Lines_Added) as Total_Additions
FROM MergeRequest 
GROUP BY Author 
ORDER BY PRs_Merged DESC
```

This merge request logger provides powerful insights into your development workflow and helps track the evolution of your project! 🚀 