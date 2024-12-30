import { GoogleSpreadsheet } from 'google-spreadsheet';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getSpreadsheetId() {
  const client = new SecretManagerServiceClient();
  const name = 'projects/civil-forge-403609/secrets/SHEETS_ID_BUCK_TRACKER/versions/latest';
  const [version] = await client.accessSecretVersion({ name });
  return version.payload.data.toString();
}

async function getSheet() {
  console.log('[DEBUG] Getting spreadsheet ID');
  const spreadsheetId = await getSpreadsheetId();
  console.log('[DEBUG] Creating GoogleSpreadsheet instance');
  const doc = new GoogleSpreadsheet(spreadsheetId);
  
  console.log('[DEBUG] Authenticating with service account');
  // Use default credentials from Cloud Run environment
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
  
  console.log('[DEBUG] Loading spreadsheet info');
  await doc.loadInfo();
  
  let sheet = doc.sheetsByTitle['Errors'];
  if (!sheet) {
    console.log('[DEBUG] Creating new Errors sheet');
    // Create the sheet if it doesn't exist
    sheet = await doc.addSheet({
      title: 'Errors',
      headerValues: ['Timestamp', 'Service', 'Severity', 'Error Message', 'Stack Trace', 'Metadata']
    });
  }
  console.log('[DEBUG] Sheet ready');
  
  return sheet;
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
  } catch (error) {
    console.error('Error saving to sheet:', error);
    console.error('[DEBUG] Error saving to sheet:', {
      error: error.message,
      stack: error.stack,
      service,
      severity
    });
    throw error;
  }
}