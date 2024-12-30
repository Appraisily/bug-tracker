import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Cache for spreadsheet ID
let spreadsheetId = null;

// Secret Manager client (lazy initialization)
let secretManagerClient = null;

function getSecretManagerClient() {
  if (!secretManagerClient) {
    console.log('[DEBUG] Initializing Secret Manager client');
    secretManagerClient = new SecretManagerServiceClient();
  }
  return secretManagerClient;
}

/**
 * Retrieves the spreadsheet ID from Secret Manager.
 * The ID is stored in a secret named 'SHEETS_ID_BUG_TRACKER'.
 */
export async function initializeConfig() {
  try {
    if (spreadsheetId) {
      console.log('[DEBUG] Config already initialized');
      return;
    }

    const client = getSecretManagerClient();
    const name = 'projects/civil-forge-403609/secrets/SHEETS_ID_BUG_TRACKER/versions/latest';
    
    console.log('[DEBUG] Fetching spreadsheet ID from Secret Manager');
    const [version] = await client.accessSecretVersion({ name });
    spreadsheetId = version.payload.data.toString();
    
    console.log('[DEBUG] Successfully retrieved spreadsheet ID from Secret Manager');
  } catch (error) {
    console.error('[DEBUG] Failed to initialize config:', error);
    throw new Error('Failed to retrieve spreadsheet ID from Secret Manager: ' + error.message);
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