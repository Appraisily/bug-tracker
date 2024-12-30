import { getSheetsClient } from './auth.js';
import { initializeConfig, getSpreadsheetId } from './config.js';

async function writeHelloWorld() {
  try {
    console.log('[DEBUG] Starting hello world test');

    await initializeConfig();
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();

    // Write data
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Test!A:B',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [['Hello World', new Date().toISOString()]]
      }
    });

    console.log('[DEBUG] Successfully wrote hello world to sheet');
    process.exit(0);
  } catch (error) {
    console.error('[DEBUG] Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || error.response
    });
    process.exit(1);
  }
}

writeHelloWorld();