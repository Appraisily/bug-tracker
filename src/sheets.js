import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthenticatedClient() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });
  
  return serviceAccountAuth;
}

async function getSheet() {
  const auth = await getAuthenticatedClient();
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
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