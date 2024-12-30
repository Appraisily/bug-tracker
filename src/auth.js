import { google } from 'googleapis';

let cachedSheets = null;

export async function getSheetsClient() {
  if (cachedSheets) {
    console.log('[DEBUG] Using cached sheets client');
    return cachedSheets;
  }

  console.log('[DEBUG] Creating new sheets client');
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const authClient = await auth.getClient();
  cachedSheets = google.sheets({ version: 'v4', auth: authClient });
  console.log('[DEBUG] Successfully created sheets client');
  return cachedSheets;
}