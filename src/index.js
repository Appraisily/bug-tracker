import dotenv from 'dotenv';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { GoogleAuth } from 'google-auth-library';

dotenv.config();

async function writeHelloWorld() {
  try {
    console.log('[DEBUG] Starting hello world test');
    
    // Create auth client
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const client = await auth.getClient();
    
    // Initialize spreadsheet
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
    await doc.useServiceAccountAuth(client);
    await doc.loadInfo();
    
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
    console.error('[DEBUG] Error:', error);
    process.exit(1);
  }
}

writeHelloWorld();