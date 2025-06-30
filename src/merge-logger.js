const core = require('@actions/core');
const { MergeRequestLogger } = require('./merge-request-logger');

async function main() {
  try {
    console.log('🔀 Starting merge request logger...');
    
    const mergeLogger = new MergeRequestLogger();
    await mergeLogger.processMergeRequest();
    
    console.log('✅ Merge request logging completed successfully!');
  } catch (error) {
    console.error('❌ Error in merge request logger:', error);
    core.setFailed(error.message);
    process.exit(1);
  }
}

main(); 