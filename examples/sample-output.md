# Sample Output

This shows examples of what your Google Sheets data will look like after commits are processed.

## Example Commits and AI Explanations

### 1. Feature Addition
**Commit:** `Add user authentication system`
**Files:** 8 files changed, +245 -12 lines
**AI Explanation:** "This commit implements a comprehensive user authentication system using JWT tokens. It adds login/logout functionality, password hashing with bcrypt, and middleware for protecting routes. This is a significant security enhancement that enables user-specific features and data protection."

### 2. Bug Fix
**Commit:** `Fix memory leak in data processing`
**Files:** 2 files changed, +15 -8 lines
**AI Explanation:** "This commit addresses a memory leak in the data processing module by properly disposing of event listeners and clearing cached data. The fix prevents memory consumption from growing unbounded during long-running operations, improving application stability."

### 3. Refactoring
**Commit:** `Refactor API endpoints to use async/await`
**Files:** 12 files changed, +89 -156 lines
**AI Explanation:** "This commit modernizes the API endpoints by replacing Promise chains with async/await syntax. This improves code readability, error handling, and maintainability while reducing nested callback complexity throughout the application."

### 4. Documentation
**Commit:** `Update README with deployment instructions`
**Files:** 1 file changed, +23 -5 lines
**AI Explanation:** "This commit enhances the project documentation by adding comprehensive deployment instructions. It includes environment setup, configuration steps, and troubleshooting tips, making it easier for new developers to set up and deploy the application."

### 5. Performance Optimization
**Commit:** `Optimize database queries with indexing`
**Files:** 4 files changed, +34 -12 lines
**AI Explanation:** "This commit improves database performance by adding strategic indexes and optimizing query patterns. The changes reduce query execution time by up to 80% for common operations, significantly improving application response times."

## Spreadsheet View

Here's how this data appears in your Google Sheet:

| Timestamp | Repository | Branch | SHA | Author | Message | Files | + | - | AI Explanation | URL |
|-----------|------------|--------|-----|--------|---------|-------|---|---|----------------|-----|
| 2024-01-15T10:30:00Z | myorg/webapp | main | a1b2c3d4 | Alice Dev | Add user authentication system | 8 | 245 | 12 | This commit implements a comprehensive user authentication... | [Link](https://github.com/myorg/webapp/commit/a1b2c3d4) |
| 2024-01-15T11:45:00Z | myorg/webapp | bugfix/memory | f5e6d7c8 | Bob Fix | Fix memory leak in data processing | 2 | 15 | 8 | This commit addresses a memory leak in the data processing... | [Link](https://github.com/myorg/webapp/commit/f5e6d7c8) |
| 2024-01-15T14:20:00Z | myorg/webapp | main | 9h8i7j6k | Carol Code | Refactor API endpoints to use async/await | 12 | 89 | 156 | This commit modernizes the API endpoints by replacing... | [Link](https://github.com/myorg/webapp/commit/9h8i7j6k) |

## Data Analysis Possibilities

With this rich commit data, you can:

1. **Track Development Velocity**
   - Commits per day/week
   - Lines of code changes over time
   - Feature delivery frequency

2. **Identify Patterns**
   - Most active contributors
   - Common commit types (features, bugs, refactoring)
   - Files that change frequently

3. **Quality Insights**
   - Ratio of feature additions vs bug fixes
   - Commit message quality trends
   - Code churn analysis

4. **Team Productivity**
   - Individual contribution metrics
   - Collaboration patterns
   - Work distribution across team members

5. **Project Health**
   - Frequency of refactoring commits
   - Documentation update frequency
   - Technical debt indicators 