import { initializeConfig, getSpreadsheetId } from './config.js';
import { writeError } from './sheets.js';

async function testErrorLogging() {
  try {
    console.log('[DEBUG] Starting error logging test');
    await initializeConfig();
    
    await writeError({
      service: 'test-service',
      severity: 'ERROR',
      message: 'Test error message',
      stack: 'Error: Test error\n    at testErrorLogging',
      metadata: { test: true }
    });
    
    console.log('[DEBUG] Successfully logged test error');
  } catch (error) {
    console.error('[DEBUG] Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || error.response
    });
    throw error;
  }
}
