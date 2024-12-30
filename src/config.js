// Cache for spreadsheet ID
let spreadsheetId = null;

/**
 * Initializes configuration by getting spreadsheet ID.
 * In Cloud Run, this will come from the runtime configuration.
 */
export async function initializeConfig() {
  try {
    if (spreadsheetId) {
      console.log('[DEBUG] Config already initialized');
      return;
    }

    // In Cloud Run, this comes from the runtime configuration
    spreadsheetId = process.env.SHEETS_ID_BUG_TRACKER;
    
    if (!spreadsheetId) {
      throw new Error('SHEETS_ID_BUG_TRACKER environment variable is not set');
    }
    
    console.log('[DEBUG] Successfully initialized configuration');
  } catch (error) {
    console.error('[DEBUG] Failed to initialize config:', error);
    throw error;
  }
}

/**
 * Returns the cached spreadsheet ID or throws if not initialized.
 */
export function getSpreadsheetId() {
  if (!spreadsheetId) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  return spreadsheetId;
}