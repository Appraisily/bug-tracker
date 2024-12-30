import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretManagerClient = new SecretManagerServiceClient();
let spreadsheetId = null;

export async function initializeConfig() {
  try {
    const name = 'projects/civil-forge-403609/secrets/SHEETS_ID_BUG_TRACKER/versions/latest';
    console.log('[DEBUG] Initializing config - accessing secret version');
    debugger;
    const [version] = await secretManagerClient.accessSecretVersion({ name });
    spreadsheetId = version.payload.data.toString();
    console.log('[DEBUG] Successfully initialized spreadsheet ID');
  } catch (error) {
    console.error('[DEBUG] Error initializing config:', error);
    throw error;
  }
}

export function getSpreadsheetId() {
  if (!spreadsheetId) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  return spreadsheetId;
}