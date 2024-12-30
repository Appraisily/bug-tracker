import { GoogleAuth } from 'google-auth-library';

let cachedAuth = null;
let cachedClient = null;

export async function getAuthenticatedClient() {
  if (cachedClient) {
    console.log('[DEBUG] Using cached authenticated client');
    return cachedClient;
  }

  console.log('[DEBUG] Creating new authenticated client');
  if (!cachedAuth) {
    cachedAuth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  }

  cachedClient = await cachedAuth.getClient();
  console.log('[DEBUG] Successfully created authenticated client');
  return cachedClient;
}