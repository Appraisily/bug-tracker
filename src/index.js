import { initializeConfig } from './config.js';
import { startServer } from './server.js';
import { startPubSubListener } from './services/pubsub/index.js';

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