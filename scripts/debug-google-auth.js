#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 Debugging Google Authentication Issues...\n');

// Check environment variables
console.log('1. Checking Environment Variables:');
console.log('   GOOGLE_SHEETS_SPREADSHEET_ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? '✅ Set' : '❌ Missing');
console.log('   GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
console.log('   GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');

if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
  console.log('   Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
}

if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
  console.log('   Spreadsheet ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
}

// Check private key format
console.log('\n2. Checking Private Key Format:');
if (process.env.GOOGLE_PRIVATE_KEY) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  
  console.log('   Private Key Length:', privateKey.length, 'characters');
  console.log('   Starts with BEGIN PRIVATE KEY:', privateKey.includes('-----BEGIN PRIVATE KEY-----') ? '✅' : '❌');
  console.log('   Ends with END PRIVATE KEY:', privateKey.includes('-----END PRIVATE KEY-----') ? '✅' : '❌');
  console.log('   Contains \\n characters:', privateKey.includes('\\n') ? '✅' : '❌');
  
  // Show first and last 50 characters (safely)
  console.log('   First 50 chars:', privateKey.substring(0, 50) + '...');
  console.log('   Last 50 chars:', '...' + privateKey.substring(privateKey.length - 50));
  
  // Check if it's properly formatted after replacement
  const processedKey = privateKey.replace(/\\n/g, '\n');
  console.log('   After \\n replacement:', processedKey.split('\n').length, 'lines');
} else {
  console.log('   ❌ Private key not found');
}

// Test credentials format
console.log('\n3. Testing Credential Object Creation:');
try {
  const credentials = {
    type: 'service_account',
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  
  console.log('   ✅ Credential object created successfully');
  console.log('   Type:', credentials.type);
  console.log('   Client Email:', credentials.client_email);
  console.log('   Private Key Valid Format:', credentials.private_key && credentials.private_key.includes('-----BEGIN PRIVATE KEY-----') ? '✅' : '❌');
  
} catch (error) {
  console.log('   ❌ Error creating credential object:', error.message);
}

// Provide troubleshooting tips
console.log('\n🔧 Troubleshooting Tips:');
console.log('');
console.log('If you see issues above, here are common fixes:');
console.log('');
console.log('1. **Private Key Format Issues:**');
console.log('   - Make sure to copy the ENTIRE private key from the JSON file');
console.log('   - Include -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----');
console.log('   - Keep all the \\n characters as they appear in the JSON');
console.log('');
console.log('2. **GitHub Secrets Setup:**');
console.log('   - Don\'t add extra quotes around the private key');
console.log('   - Copy exactly as it appears in the JSON file');
console.log('   - Make sure there are no trailing spaces');
console.log('');
console.log('3. **Google Sheet Sharing:**');
console.log('   - Share your Google Sheet with the service account email');
console.log('   - Give it "Editor" permissions');
console.log('   - Make sure to uncheck "Notify people"');
console.log('');
console.log('4. **Service Account Setup:**');
console.log('   - Ensure Google Sheets API is enabled in your project');
console.log('   - The service account should have the correct permissions');
console.log(''); 