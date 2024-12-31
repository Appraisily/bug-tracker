import { processLogEntry } from '../../utils/logging.js';

let isProcessing = false;

export async function handlePubSubMessage(message) {
  if (isProcessing) {
    message.nack();
    return;
  }

  isProcessing = true;
  
  try {
    console.log('[DEBUG] Processing message:', message.id);
    
    const data = Buffer.from(message.data, 'base64').toString();
    const logEntry = JSON.parse(data);
    
    await processLogEntry(logEntry);
    
    message.ack();
    console.log('[DEBUG] Successfully processed message:', message.id);
  } catch (error) {
    console.error('[DEBUG] Error processing message:', {
      messageId: message.id,
      error: error.message || 'Unknown error',
      stack: error.stack
    });
    message.nack();
  } finally {
    isProcessing = false;
  }
}