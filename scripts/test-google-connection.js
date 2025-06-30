#!/usr/bin/env node

require('dotenv').config();
const { google } = require('googleapis');

async function testGoogleConnection() {
  console.log('🧪 Testing Google Sheets Connection...\n');
  
  try {
    // Initialize auth using GoogleAuth (same as our sheets service)
    console.log('1. Creating authentication...');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    console.log('   ✅ Auth object created');
    
    // Initialize sheets
    console.log('2. Initializing Google Sheets API...');
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    console.log('   ✅ Sheets API initialized');
    
    // Test connection by reading spreadsheet metadata
    console.log('3. Testing connection to your spreadsheet...');
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      fields: 'properties.title'
    });
    
    console.log('   ✅ Successfully connected to Google Sheets!');
    console.log('   📊 Spreadsheet title:', response.data.properties.title);
    
    // Test reading a range
    console.log('4. Testing read access...');
    try {
      const readResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'CommitLog!A1:A1',
      });
      
      console.log('   ✅ Successfully read from spreadsheet');
      console.log('   📝 Data:', readResponse.data.values || 'No data in A1');
      
    } catch (readError) {
      console.log('   ⚠️  Could not read from spreadsheet:', readError.message);
      console.log('   💡 This might mean the sheet "CommitLog" doesn\'t exist yet (that\'s okay)');
    }
    
    console.log('\n🎉 Google Sheets connection test passed!');
    console.log('💡 If GitHub Actions is still failing, the issue might be with how secrets are configured.');
    
  } catch (error) {
    console.error('\n❌ Google Sheets connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid Credentials')) {
      console.log('\n🔧 This suggests:');
      console.log('1. Service account private key is malformed');
      console.log('2. Service account email is incorrect');
      console.log('3. Google Sheets API is not enabled');
    }
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      console.log('\n🔧 This suggests:');
      console.log('1. Spreadsheet ID is incorrect');
      console.log('2. Sheet is not shared with the service account');
      console.log('3. Service account doesn\'t have Editor permissions');
    }
  }
}

testGoogleConnection(); 