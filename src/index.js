import { GoogleSpreadsheet } from 'google-spreadsheet';
import { getAuthenticatedClient } from './auth.js';
import { initializeConfig, getSpreadsheetId } from './config.js';

async function writeHelloWorld() {
  try {
    console.log('[DEBUG] Starting hello world test');
    
    // Initialize config to get spreadsheet ID from Secret Manager
    await initializeConfig();
    
    // Initialize spreadsheet with auth
    const spreadsheetId = getSpreadsheetId();
    const doc = new GoogleSpreadsheet(spreadsheetId);
    const client = await getAuthenticatedClient();
    await doc.useServiceAccountAuth(client);
    
    // Load document info
    await doc.loadInfo();
    console.log('[DEBUG] Loaded spreadsheet:', doc.title);
    
    // Get or create sheet
    let sheet = doc.sheetsByTitle['Test'];
    if (!sheet) {
      sheet = await doc.addSheet({ title: 'Test', headerValues: ['Message', 'Timestamp'] });
    }
    
    // Write test row
    await sheet.addRow({
      Message: 'Hello World',
      Timestamp: new Date().toISOString()
    });
    
    console.log('[DEBUG] Successfully wrote hello world to sheet');
    process.exit(0);
  } catch (error) {
    console.error('[DEBUG] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errors: error.errors,
      response: error.response?.data
    });
    process.exit(1);
  }
}

writeHelloWorld();