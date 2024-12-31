import { getSheetsClient } from './auth.js';
import { getSpreadsheetId } from './config.js';

const SHEET_NAME = 'Errors';
const HEADERS = ['Timestamp', 'Service', 'Severity', 'Error Message', 'Stack Trace', 'Metadata'];

async function ensureSheetExists() {
  const spreadsheetId = getSpreadsheetId();
  const sheets = await getSheetsClient();

  try {
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

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A1:F1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [HEADERS]
        }
      });
    }
  } catch (error) {
    console.error('[DEBUG] Error ensuring sheet exists:', error.message);
    throw error;
  }
}

export async function writeError(error) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = await getSheetsClient();

  try {
    await ensureSheetExists();

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
          (error.message || error.errorMessage || '').replace(/\n/g, ' '),
          error.stack || error.stackTrace || '',
          JSON.stringify(error.metadata || {}, null, 2)
        ]]
      }
    });

    console.log('[DEBUG] Successfully wrote error to sheet');
  } catch (err) {
    console.error('[DEBUG] Error writing to sheet:', err.message);
    throw err;
  }
}