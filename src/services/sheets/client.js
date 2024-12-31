import { google } from 'googleapis';

let sheetsClient = null;

export async function getSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  console.log('[DEBUG] Initializing sheets client');
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const authClient = await auth.getClient();
  sheetsClient = google.sheets({ version: 'v4', auth: authClient });
  console.log('[DEBUG] Successfully created sheets client');
  return sheetsClient;
}