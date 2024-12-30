import { GoogleSpreadsheet } from 'google-spreadsheet';
import { getSpreadsheetId } from './config.js';
import { GoogleAuth } from 'google-auth-library';

async function getSheet() {
  console.log('[DEBUG] Getting spreadsheet ID');
  try {
    const spreadsheetId = getSpreadsheetId();
    console.log('[DEBUG] Got spreadsheet ID:', spreadsheetId);

    console.log('[DEBUG] Creating GoogleSpreadsheet instance');
    const doc = new GoogleSpreadsheet(spreadsheetId);
    
    console.log('[DEBUG] Authenticating with service account');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const client = await auth.getClient();
    await doc.useServiceAccountAuth(client);
    
    console.log('[DEBUG] Loading spreadsheet info');
    await doc.loadInfo();
    console.log('[DEBUG] Spreadsheet info loaded:', {
      title: doc.title,
      sheetCount: doc.sheetCount,
      availableSheets: Object.keys(doc.sheetsByTitle)
    });
    
    let sheet = doc.sheetsByTitle['Errors'];
    if (!sheet) {
      console.log('[DEBUG] Creating new Errors sheet');
      sheet = await doc.addSheet({
        title: 'Errors',
        headerValues: ['Timestamp', 'Service', 'Severity', 'Error Message', 'Stack Trace', 'Metadata']
      });
      console.log('[DEBUG] New sheet created');
    }
    
    return sheet;
  } catch (error) {
    console.error('[DEBUG] Error in getSheet:', {
      error: error.message,
      stack: error.stack,
      code: error.code || 'NO_CODE',
      details: error.details || 'NO_DETAILS',
      type: error.constructor.name
    });
    throw error;
  }
}

export async function saveError({ timestamp, service, severity, errorMessage, stackTrace, metadata }) {
  try {
    console.log('[DEBUG] Starting to save error', { service, severity });
    const sheet = await getSheet();
    console.log('[DEBUG] Adding new row to sheet');
    await sheet.addRow({
      Timestamp: timestamp,
      Service: service,
      Severity: severity,
      'Error Message': errorMessage,
      'Stack Trace': stackTrace,
      Metadata: metadata
    });
    console.log('[DEBUG] Successfully added row to sheet');
  } catch (error) {
    console.error('Error saving to sheet:', error);
    console.error('[DEBUG] Error saving to sheet:', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name,
      service,
      severity
    });
    throw error;
  }
}