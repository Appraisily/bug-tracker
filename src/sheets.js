import { getSheetsClient, invalidateCache } from './auth.js';
import { getSpreadsheetId } from './config.js';

const SHEET_NAME = 'Errors';
const HEADERS = ['Timestamp', 'Service', 'Severity', 'Error Message', 'Stack Trace', 'Metadata'];

async function ensureSheetExists() {
  const spreadsheetId = getSpreadsheetId();
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties'
  });

  const sheet = spreadsheet.data.sheets?.find(
    sheet => sheet.properties?.title === SHEET_NAME
  );

  if (!sheet) {
    console.log(`[DEBUG] Creating ${SHEET_NAME} sheet`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: SHEET_NAME
            }
          }
        }]
      }
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:F1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [HEADERS]
      }
    });
  }
}

export async function writeError(error) {
  try {
    await ensureSheetExists();
    
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[
          new Date().toISOString(),
          error.service || 'unknown',
          error.severity || 'ERROR',
          error.message,
          error.stack || '',
          JSON.stringify(error.metadata || {})
        ]]
      }
    });

    console.log('[DEBUG] Successfully wrote error to sheet');
  } catch (error) {
    if (error.message?.includes('network socket disconnected')) {
      await invalidateCache();
      // Retry once with fresh client
      try {
        const sheets = await getSheetsClient();
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${SHEET_NAME}!A:F`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [[
              new Date().toISOString(),
              error.service || 'unknown',
              error.severity || 'ERROR',
              error.message,
              error.stack || '',
              JSON.stringify(error.metadata || {})
            ]]
          }
        });
        console.log('[DEBUG] Successfully wrote error to sheet after retry');
        return;
      } catch (retryError) {
        console.error('[DEBUG] Error writing to sheet after retry:', {
          message: retryError.message,
          stack: retryError.stack,
          response: retryError.response?.data || retryError.response
        });
      }
    }
    console.error('[DEBUG] Error writing to sheet:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || error.response
    });
    throw error;
  }
}