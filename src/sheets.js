import { GoogleSpreadsheet } from 'google-spreadsheet';
import { getSpreadsheetId } from './config.js';
import { getAuthenticatedClient } from './auth.js';

let cachedDoc = null;
let lastInfoLoad = null;
const INFO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function getSheet() {
  console.log('[DEBUG] Getting spreadsheet ID');
  try {
    const spreadsheetId = getSpreadsheetId();
    console.log('[DEBUG] Got spreadsheet ID:', spreadsheetId);

    const needsInfoReload = !lastInfoLoad || (Date.now() - lastInfoLoad) > INFO_REFRESH_INTERVAL;
    
    if (!cachedDoc) {
      console.log('[DEBUG] Creating new GoogleSpreadsheet instance');
      cachedDoc = new GoogleSpreadsheet(spreadsheetId);
      
      console.log('[DEBUG] Authenticating with service account');
      const client = await getAuthenticatedClient();
      await cachedDoc.useServiceAccountAuth(client);
    } else {
      console.log('[DEBUG] Using cached spreadsheet instance');
    }
    
    if (needsInfoReload) {
      console.log('[DEBUG] Reloading spreadsheet info');
      await cachedDoc.loadInfo();
      lastInfoLoad = Date.now();
      console.log('[DEBUG] Spreadsheet info reloaded:', {
        title: cachedDoc.title,
        sheetCount: cachedDoc.sheetCount,
        lastInfoLoad
      });
    }
    
    let sheet = cachedDoc.sheetsByTitle['Errors'];
    if (!sheet) {
      console.log('[DEBUG] Creating new Errors sheet');
      sheet = await cachedDoc.addSheet({
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
      type: error.constructor.name,
      hadCachedDoc: !!cachedDoc,
      lastInfoLoad: lastInfoLoad ? new Date(lastInfoLoad).toISOString() : null
    });
    
    // Reset cache on error
    cachedDoc = null;
    lastInfoLoad = null;
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