import { processLogEntry } from '../../utils/logging.js';

const messageQueue = [];
let processingPromise = null;

async function processNextMessage() {
  if (messageQueue.length === 0 || processingPromise) {
    return;
  }

  const message = messageQueue[0];
  try {
    console.log('[DEBUG] Processing message:', message.id);
    
    const data = Buffer.from(message.data, 'base64').toString();
    const logEntry = JSON.parse(data);
    
    await processLogEntry(logEntry);
    
    // Only remove from queue and ack if processing succeeded
    messageQueue.shift();
    message.ack();
    console.log('[DEBUG] Successfully processed message:', message.id);
  } catch (error) {
    console.error('[DEBUG] Error processing message:', {
      messageId: message.id,
      error: error.message || 'Unknown error',
      stack: error.stack
    });
    // On error, nack the message and remove it from queue
    messageQueue.shift();
    message.nack(); 
  } finally {
    processingPromise = null;
    // Process next message if any
    if (messageQueue.length > 0) {
      processingPromise = processNextMessage();
    }
  }
}

export function handlePubSubMessage(message) {
  // Add message to queue
  messageQueue.push(message);
  
  // Start processing if not already processing
  if (!processingPromise) {
    processingPromise = processNextMessage();
  }
}