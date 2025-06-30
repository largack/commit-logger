#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs');

async function testWithJSONFile() {
  console.log('🧪 Testing Google Sheets with Direct JSON File...\n');
  
  try {
    // Read the JSON file directly
    console.log('1. Reading backup.json file...');
    const credentials = JSON.parse(fs.readFileSync('backup.json', 'utf8'));
    console.log('   ✅ JSON file loaded');
    console.log('   📧 Service Account Email:', credentials.client_email);
    console.log('   🆔 Project ID:', credentials.project_id);
    
    // Initialize auth with the JSON directly
    console.log('2. Creating authentication from JSON...');
    const auth = google.auth.fromJSON(credentials);
    console.log('   ✅ Auth object created from JSON');
    
    // Initialize sheets
    console.log('3. Initializing Google Sheets API...');
    const sheets = google.sheets({ version: 'v4', auth: auth });
    console.log('   ✅ Sheets API initialized');
    
    // Test connection
    console.log('4. Testing connection to spreadsheet...');
    const spreadsheetId = '16OtIENH95uZt7_nwTGeSMgcJNp6B314lJprz126f0oE';
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      fields: 'properties.title'
    });
    
    console.log('   ✅ SUCCESS! Connected to Google Sheets');
    console.log('   📊 Spreadsheet title:', response.data.properties.title);
    
    // Test read access
    console.log('5. Testing read access...');
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A1:A1',
    });
    
    console.log('   ✅ Read access works!');
    console.log('   📝 Data in A1:', readResponse.data.values || 'Empty');
    
    console.log('\n🎉 All tests passed! The JSON credentials work perfectly.');
    console.log('💡 The issue might be with how the private key is formatted in environment variables.');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid Credentials')) {
      console.log('\n🔧 Since the JSON looks correct, this suggests:');
      console.log('1. The service account might be disabled in Google Cloud');
      console.log('2. The credentials have been revoked');
      console.log('3. The Google Cloud project has restrictions');
    }
    
    if (error.message.includes('not found')) {
      console.log('\n🔧 This suggests:');
      console.log('1. Spreadsheet ID is wrong');
      console.log('2. Sheet is not shared with the service account');
    }
  }
}

testWithJSONFile(); 