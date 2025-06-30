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
}

module.exports = { OpenAIService }; 