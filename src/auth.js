import { GoogleAuth } from 'google-auth-library';

let cachedCredentials = null;

export async function getAuthenticatedClient() {
  if (cachedCredentials) {
    console.log('[DEBUG] Using cached credentials');
    return cachedCredentials;
  }

  console.log('[DEBUG] Creating new credentials');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  cachedCredentials = await auth.getCredentials();
  console.log('[DEBUG] Successfully created credentials');
  return cachedCredentials;
}