import { GoogleSpreadsheet } from 'google-spreadsheet';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSpreadsheetId() {
  const client = new SecretManagerServiceClient();
  const name = 'projects/civil-forge-403609/secrets/SHEETS_ID_BUCK_TRACKER/versions/latest';
  const [version] = await client.accessSecretVersion({ name });
  return version.payload.data.toString();
}

async function getSheet() {
  const spreadsheetId = await getSpreadsheetId();
  const doc = new GoogleSpreadsheet(spreadsheetId);
  
  // Use Application Default Credentials
  await doc.useServiceAccountAuth({
    scopes: SCOPES
  });
  
  await doc.loadInfo();
  
  let sheet = doc.sheetsByTitle['Errors'];
  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = await doc.addSheet({
      title: 'Errors', headerValues: ['Timestamp', 'Service', 'Severity', 'Error Message', 'Stack Trace', 'Metadata']
    });
  }
  
  return sheet;
}

export async function saveError({ timestamp, service, severity, errorMessage, stackTrace, metadata }) {
  const sheet = await getSheet();
  await sheet.addRow({
    Timestamp: timestamp,
    Service: service,
    Severity: severity,
    'Error Message': errorMessage,
    'Stack Trace': stackTrace,
    Metadata: metadata
  });
}