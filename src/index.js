import { initializeConfig, getSpreadsheetId } from './config.js';
import { writeError } from './sheets.js';
import { startServer } from './server.js';
import { startPubSubListener } from './pubsub.js';

async function main() {
  try {
    await initializeConfig();
    await startServer();
    await startPubSubListener();
    console.log('[DEBUG] Application started successfully');
  } catch (error) {
    console.error('[DEBUG] Application failed to start:', error);
    process.exit(1);
  }
}

main();