const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { OpenAIService } = require('./services/openai-service');
const { SheetsService } = require('./services/sheets-service');
const { Logger } = require('./utils/logger');

class DocumentationGenerator {
  constructor() {
    this.openaiService = new OpenAIService();
    this.sheetsService = new SheetsService();
  }

  parseArguments() {
    const args = process.argv.slice(2);
    const options = {};
    
    Logger.debug('Raw command line arguments:', args);
    Logger.debug('Number of arguments:', args.length);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      Logger.debug(`Processing argument ${i}: "${arg}"`);
      
      if (arg.startsWith('--')) {
        // Handle --key=value format
        if (arg.includes('=')) {
          const [key, ...valueParts] = arg.substring(2).split('=');
          const value = valueParts.join('='); // In case value contains '='
          
          // Handle boolean arguments
          if (value === 'true' || value === 'false') {
            options[key] = value === 'true';
          } else {
            options[key] = value;
          }
          Logger.debug(`Parsed ${key} = "${value}" (key=value format)`);
        } 
        // Handle --key value format
        else {
          const key = arg.substring(2);
          const value = args[i + 1];
          
          // Check if we have a value
          if (value === undefined || value.startsWith('--')) {
            Logger.warn(`No value provided for argument: ${key}`);
            continue;
          }
          
          // Handle boolean arguments
          if (value === 'true' || value === 'false') {
            options[key] = value === 'true';
          } else {
            options[key] = value;
          }
          Logger.debug(`Parsed ${key} = "${value}" (separate args format)`);
          i++; // Skip the next argument as it's the value
        }
      }
    }
    
    Logger.debug('Final parsed options:', options);
    Logger.debug('Options keys:', Object.keys(options));
    return options;
  }

  async gatherRepositoryInfo(repository, includeCodeAnalysis) {
    const startTime = Date.now();
    
    try {
      Logger.info('Gathering repository information', { repository, includeCodeAnalysis });
      
      // Get project structure
      const projectStructure = this.getProjectStructure();
      
      // Read README if it exists
      const readmeContent = this.readReadme();
      
      // Get package information
      const packageInfo = this.getPackageInfo();
      
      // Perform code analysis if requested
      let codeAnalysis = null;
      if (includeCodeAnalysis) {
        codeAnalysis = this.performCodeAnalysis();
      }
      
      const gatheringTime = Date.now() - startTime;
      Logger.info(`Repository info gathered in ${gatheringTime}ms`);
      
      return {
        projectStructure,
        readmeContent,
        packageInfo,
        codeAnalysis,
        gatheringTime
      };
      
    } catch (error) {
      Logger.error('Error gathering repository info', { error: error.message });
      throw error;
    }
  }

  getProjectStructure() {
    try {
      // Generate a tree-like structure of the project
      const result = execSync('find . -type f -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.yml" -o -name "*.yaml" | head -50', 
        { encoding: 'utf8', cwd: process.cwd() });
      
      return `Project Files:\n${result}`;
    } catch (error) {
      Logger.warn('Could not generate project structure', { error: error.message });
      return 'Project structure not available';
    }
  }

  readReadme() {
    try {
      const readmePaths = ['README.md', 'readme.md', 'README.MD', 'README.txt'];
      
      for (const readmePath of readmePaths) {
        if (fs.existsSync(readmePath)) {
          const content = fs.readFileSync(readmePath, 'utf8');
          return content.substring(0, 3000); // Limit to 3000 chars to avoid token limits
        }
      }
      
      return 'No README file found';
    } catch (error) {
      Logger.warn('Error reading README', { error: error.message });
      return 'README content not available';
    }
  }

  getPackageInfo() {
    try {
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        return `Package: ${packageJson.name || 'Unknown'}
Version: ${packageJson.version || 'Unknown'}
Description: ${packageJson.description || 'No description'}
Dependencies: ${Object.keys(packageJson.dependencies || {}).join(', ')}
Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).join(', ')}`;
      }
      
      return 'No package.json found';
    } catch (error) {
      Logger.warn('Error reading package.json', { error: error.message });
      return 'Package information not available';
    }
  }

  performCodeAnalysis() {
    try {
      Logger.info('Performing code analysis');
      
      // Get file statistics
      const jsFiles = execSync('find . -name "*.js" | wc -l', { encoding: 'utf8' }).trim();
      const totalLines = execSync('find . -name "*.js" -exec wc -l {} + | tail -1 | awk \'{print $1}\'', { encoding: 'utf8' }).trim();
      
      // Get recent commits for context
      let recentCommits = '';
      try {
        recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' });
      } catch (gitError) {
        recentCommits = 'Git history not available';
      }
      
      // Get file types
      let fileTypes = '';
      try {
        fileTypes = execSync('find . -type f | sed \'s/.*\\.//\' | sort | uniq -c | sort -nr | head -10', { encoding: 'utf8' });
      } catch (error) {
        fileTypes = 'File type analysis not available';
      }
      
      return `Code Analysis:
- JavaScript files: ${jsFiles}
- Total lines of code: ${totalLines}
- Recent commits:
${recentCommits}
- File types:
${fileTypes}`;
      
    } catch (error) {
      Logger.warn('Error performing code analysis', { error: error.message });
      return 'Code analysis not available';
    }
  }

  async generateDocumentation(options, repositoryInfo) {
    const startTime = Date.now();
    
    try {
      Logger.info('Generating documentation with AI', { type: options.type });
      
      const documentationRequest = {
        repository: options.repository,
        type: options.type,
        format: options.format,
        prompt: options.prompt,
        includeCodeAnalysis: options['include-code'],
        projectStructure: repositoryInfo.projectStructure,
        readmeContent: repositoryInfo.readmeContent,
        packageInfo: repositoryInfo.packageInfo,
        codeAnalysis: repositoryInfo.codeAnalysis
      };
      
      const generatedContent = await this.openaiService.generateDocumentation(documentationRequest);
      const generationTime = Date.now() - startTime;
      
      Logger.info(`Documentation generated in ${generationTime}ms`);
      
      return {
        content: generatedContent,
        generationTime,
        wordCount: generatedContent.split(/\s+/).length
      };
      
    } catch (error) {
      Logger.error('Error generating documentation', { error: error.message });
      throw error;
    }
  }

  async logToSheets(options, repositoryInfo, documentationResult) {
    try {
      Logger.info('Logging documentation to Google Sheets');
      
      const docData = {
        timestamp: new Date().toISOString(),
        repository: options.repository,
        type: options.type,
        format: options.format,
        triggeredBy: options['triggered-by'],
        customPrompt: options.prompt.substring(0, 500), // Limit prompt length
        includeCodeAnalysis: options['include-code'],
        generatedContent: documentationResult.content,
        wordCount: documentationResult.wordCount,
        generationTime: documentationResult.generationTime,
        status: 'Completed'
      };
      
      await this.sheetsService.appendDocumentationRow(docData);
      Logger.info('Documentation logged to Google Sheets successfully');
      
    } catch (error) {
      Logger.error('Error logging to Google Sheets', { error: error.message });
      throw error;
    }
  }

  async run() {
    try {
      const startTime = Date.now();
      
      // Parse command line arguments
      const options = this.parseArguments();
      Logger.info('Documentation generation started', options);
      
      // Validate required options
      if (!options.prompt || !options.repository) {
        Logger.error('Missing required options', { 
          receivedOptions: Object.keys(options),
          prompt: options.prompt ? 'present' : 'missing',
          repository: options.repository ? 'present' : 'missing'
        });
        throw new Error(`Missing required options: prompt and repository. Received: ${JSON.stringify(options)}`);
      }
      
      // Gather repository information
      const repositoryInfo = await this.gatherRepositoryInfo(
        options.repository, 
        options['include-code']
      );
      
      // Generate documentation
      const documentationResult = await this.generateDocumentation(options, repositoryInfo);
      
      // Log to Google Sheets
      await this.logToSheets(options, repositoryInfo, documentationResult);
      
      const totalTime = Date.now() - startTime;
      
      console.log('\n🎉 Documentation Generation Complete!');
      console.log(`⏱️  Total time: ${totalTime}ms`);
      console.log(`📝 Word count: ${documentationResult.wordCount}`);
      console.log(`📊 Check your Google Sheets "Documentation" tab for results`);
      console.log(`🔗 Spreadsheet: https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_SPREADSHEET_ID}`);
      
      // Output a summary for GitHub Actions
      if (process.env.GITHUB_ACTIONS) {
        console.log(`\n::notice::Documentation generated successfully (${documentationResult.wordCount} words in ${totalTime}ms)`);
      }
      
    } catch (error) {
      Logger.error('Documentation generation failed', { error: error.message });
      
      if (process.env.GITHUB_ACTIONS) {
        console.log(`::error::Documentation generation failed: ${error.message}`);
      }
      
      process.exit(1);
    }
  }
}

// Run the documentation generator if this file is executed directly
if (require.main === module) {
  const generator = new DocumentationGenerator();
  generator.run();
}

module.exports = { DocumentationGenerator }; 