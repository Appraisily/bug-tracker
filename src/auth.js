import { google } from 'googleapis';

let cachedSheets = null;
let lastInitTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSheetsClient() {
  const now = Date.now();
  if (cachedSheets && lastInitTime && (now - lastInitTime) < CACHE_TTL) {
    console.log('[DEBUG] Using cached sheets client');
    return cachedSheets;
  }

  console.log('[DEBUG] Initializing new sheets client');
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const authClient = await auth.getClient();
  cachedSheets = google.sheets({ version: 'v4', auth: authClient });
  lastInitTime = now;
  console.log('[DEBUG] Successfully created sheets client');
  return cachedSheets;
}

export async function invalidateCache() {
  console.log('[DEBUG] Invalidating sheets client cache');
  cachedSheets = null;
  lastInitTime = null;
}