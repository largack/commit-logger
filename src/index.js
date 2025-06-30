const core = require('@actions/core');
const { CommitLogger } = require('./commit-logger');

async function main() {
  try {
    console.log('🚀 Starting commit logger...');
    
    const commitLogger = new CommitLogger();
    await commitLogger.processCommit();
    
    console.log('✅ Commit logging completed successfully!');
  } catch (error) {
    console.error('❌ Error in commit logger:', error);
    core.setFailed(error.message);
    process.exit(1);
  }
}

main(); 