const OpenAI = require('openai');
const { Logger } = require('../utils/logger');
const { RetryUtil } = require('../utils/retry');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async explainCommit(commitData) {
    try {
      Logger.debug('Generating AI explanation for commit', { sha: commitData.sha });
      
      return await RetryUtil.withRetry(async () => {
        const prompt = this.buildCommitAnalysisPrompt(commitData);
        
        const completion = await this.openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert software engineer who analyzes code commits. Provide clear, concise explanations of what changes were made and why they might be important. Focus on the business impact and technical significance."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        });

        const explanation = completion.choices[0].message.content.trim();
        Logger.debug('AI explanation generated successfully');
        return explanation;
      }, 3, 2000);
      
    } catch (error) {
      Logger.error('Error generating AI explanation', { error: error.message });
      return `Error generating AI explanation: ${error.message}`;
    }
  }

  async analyzeMergeRequest(prData) {
    try {
      Logger.debug('Generating AI analysis for merge request', { prNumber: prData.number });
      
      return await RetryUtil.withRetry(async () => {
        const prompt = this.buildMergeRequestAnalysisPrompt(prData);
        
        const completion = await this.openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert software engineer who analyzes pull requests and merge requests. Provide clear, concise explanations of what changes were made, their business impact, and technical significance. Focus on the overall feature or improvement being delivered."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 600,
          temperature: 0.3
        });

        const analysis = completion.choices[0].message.content.trim();
        Logger.debug('AI merge analysis generated successfully');
        return analysis;
      }, 3, 2000);
      
    } catch (error) {
      Logger.error('Error generating AI merge analysis', { error: error.message });
      return `Error generating AI analysis: ${error.message}`;
    }
  }

  buildCommitAnalysisPrompt(commitData) {
    return `Analyze this Git commit and provide a clear explanation of what was changed and why it might be significant:

**Repository:** ${commitData.repository}
**Branch:** ${commitData.branch}
**Author:** ${commitData.author}
**Commit Message:** ${commitData.message}
**Files Changed:** ${commitData.filesChanged}
**Lines Added:** ${commitData.additions}
**Lines Deleted:** ${commitData.deletions}

**Code Changes:**
${commitData.diff}

Please provide:
1. A summary of what was changed
2. The likely purpose/intent of these changes
3. Any potential impact or significance

Keep the explanation concise but informative (2-3 sentences).`;
  }

  buildMergeRequestAnalysisPrompt(prData) {
    return `Analyze this Pull Request and provide a comprehensive explanation of the changes and their significance:

**Repository:** ${prData.repository}
**PR #${prData.number}:** ${prData.title}
**Type:** ${prData.type}
**Branch:** ${prData.sourceBranch} → ${prData.targetBranch}
**Author:** ${prData.author}
**Merged By:** ${prData.mergedBy}
**Files Changed:** ${prData.filesChanged}
**Lines Added:** ${prData.additions}
**Lines Deleted:** ${prData.deletions}
**Commits:** ${prData.commits}

**PR Description:**
${prData.body}

**Code Changes:**
${prData.diff}

Please provide:
1. A summary of the feature/change being introduced
2. The business value and technical impact
3. Any notable implementation details or patterns
4. Potential risks or considerations

Keep the analysis comprehensive but concise (3-4 sentences).`;
  }

  async generateDocumentation(documentationRequest) {
    try {
      Logger.debug('Generating AI documentation', { type: documentationRequest.type });
      
      return await RetryUtil.withRetry(async () => {
        const prompt = this.buildDocumentationPrompt(documentationRequest);
        
        const completion = await this.openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4",
          messages: [
            {
              role: "system",
              content: this.getDocumentationSystemPrompt(documentationRequest.type, documentationRequest.format)
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.2
        });

        const documentation = completion.choices[0].message.content.trim();
        Logger.debug('AI documentation generated successfully');
        return documentation;
      }, 3, 2000);
      
    } catch (error) {
      Logger.error('Error generating AI documentation', { error: error.message });
      return `Error generating AI documentation: ${error.message}`;
    }
  }

  getDocumentationSystemPrompt(type, format) {
    const basePrompt = "You are an expert technical writer who creates comprehensive, clear, and well-structured documentation.";
    
    const typeSpecific = {
      'General': "Focus on providing a complete overview that helps both new users and experienced developers understand the project.",
      'API Reference': "Create detailed API documentation with examples, parameters, return values, and error handling.",
      'User Guide': "Write user-friendly documentation that guides users through common tasks and workflows.",
      'Developer Guide': "Focus on technical implementation details, architecture decisions, and development workflows.",
      'Troubleshooting': "Create problem-solution oriented documentation that helps users resolve common issues.",
      'Architecture': "Explain the system architecture, design patterns, and technical decisions in detail.",
      'Custom': "Adapt your writing style to the specific requirements provided in the prompt."
    };

    const formatSpecific = {
      'Structured': "Use clear headings, bullet points, and organized sections.",
      'Markdown': "Format output as clean Markdown with proper syntax and structure.",
      'Technical Spec': "Use formal technical specification language with precise terminology.",
      'User Manual': "Write in a friendly, step-by-step instructional style."
    };

    return `${basePrompt} ${typeSpecific[type] || typeSpecific['General']} ${formatSpecific[format] || formatSpecific['Structured']} Ensure the documentation is accurate, actionable, and well-organized.`;
  }

  buildDocumentationPrompt(request) {
    let prompt = `Generate documentation for the following repository:

**Repository:** ${request.repository}
**Documentation Type:** ${request.type}
**Output Format:** ${request.format}
**Custom Prompt:** ${request.prompt}

**Repository Structure:**
${request.projectStructure}

**README Content:**
${request.readmeContent}`;

    if (request.includeCodeAnalysis && request.codeAnalysis) {
      prompt += `

**Code Analysis:**
${request.codeAnalysis}`;
    }

    if (request.packageInfo) {
      prompt += `

**Package Information:**
${request.packageInfo}`;
    }

    prompt += `

**Requirements:**
1. Follow the custom prompt instructions carefully
2. Ensure the documentation matches the specified type and format
3. Make the content practical and actionable
4. Include relevant examples where appropriate
5. Structure the content for easy reading and navigation

Please generate comprehensive documentation based on the above information.`;

    return prompt;
  }
}

module.exports = { OpenAIService }; 