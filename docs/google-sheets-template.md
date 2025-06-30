# Google Sheets Template

This document shows you exactly what your Google Sheet will look like and how to set it up.

## Sheet Structure

The commit logger will automatically create headers in your Google Sheet. Here's what each column contains:

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Timestamp | ISO timestamp when commit was processed | 2024-01-15T14:30:00.000Z |
| B | Repository | GitHub repository name | myorg/awesome-project |
| C | Branch | Git branch name | main |
| D | Commit SHA | Short commit hash (8 chars) | a1b2c3d4 |
| E | Author | Commit author name | John Doe |
| F | Commit Message | Original commit message | Fix login bug and update tests |
| G | Files Changed | Number of files modified | 3 |
| H | Lines Added | Lines of code added | 45 |
| I | Lines Deleted | Lines of code removed | 12 |
| J | AI Explanation | GPT-4 generated explanation | This commit fixes a critical authentication bug by updating the login validation logic and adds comprehensive test coverage. |
| K | Commit URL | Direct link to GitHub commit | https://github.com/myorg/repo/commit/abc123 |

## Sample Data

Here's what a few rows might look like:

```
Timestamp                   Repository        Branch  SHA      Author    Message                    Files  +    -    AI Explanation                                          URL
2024-01-15T14:30:00.000Z   myorg/my-app      main    a1b2c3d4 John Doe  Fix authentication bug    3      45   12   This commit resolves a login issue...                  https://github.com/...
2024-01-15T15:45:00.000Z   myorg/my-app      feature f5e6d7c8 Jane Dev  Add user dashboard        8      156  23   Implements a new user dashboard with real-time...     https://github.com/...
2024-01-15T16:20:00.000Z   myorg/my-app      main    9h8i7j6k Bob Code  Update dependencies       2      5    3    Updates npm packages to latest versions for...        https://github.com/...
```

## Sheet Setup Instructions

1. **Create a new Google Sheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Click "Create" → "Blank spreadsheet"
   - Name it something like "Project Commit Log"

2. **Note the Sheet ID**
   - Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part for your environment variables

3. **Share with Service Account**
   - Click "Share" button in top right
   - Add your service account email (from Google Cloud Console)
   - Give it "Editor" permissions

4. **Optional: Format the Sheet**
   - You can pre-format columns (date format for A, URL format for K, etc.)
   - The script will work fine with any formatting
   - Headers will be automatically created on first run

## Advanced Usage

### Multiple Repositories
You can use the same sheet for multiple repositories. The "Repository" column will help you filter and organize commits by project.

### Custom Sheet Name
By default, the script uses a sheet named "CommitLog". You can change this by setting the `SHEET_NAME` environment variable.

### Data Analysis
With all your commit data in one place, you can:
- Create pivot tables to analyze commit patterns
- Track productivity metrics
- Identify code hotspots
- Monitor team contributions
- Analyze commit frequency and timing

### Formulas and Charts
Add additional columns with formulas like:
- `=WEEKDAY(A2)` to get day of week
- `=HOUR(A2)` to get hour of commit
- Create charts showing commits over time
- Track lines of code changes

## Troubleshooting

**Headers not appearing?**
- Check that your service account has Editor access
- Verify the sheet name matches your `SHEET_NAME` environment variable

**Data not formatting correctly?**
- The script uses raw values - you can format columns after data is added
- Timestamps are in ISO format - apply date formatting to column A

**Multiple sheets in one workbook?**
- Each repository/environment can use a different sheet name
- Set `SHEET_NAME` environment variable accordingly 