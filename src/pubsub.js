import { PubSub } from '@google-cloud/pubsub';
import { processLogEntry } from './logging.js';

const MAX_MESSAGES = 100;
const pubsub = new PubSub();
const subscriptionName = process.env.PUBSUB_SUBSCRIPTION || 'bug-tracker-errors';

export async function startPubSubListener() {
  const subscription = pubsub.subscription(subscriptionName, {
    flowControl: {
      maxMessages: MAX_MESSAGES
    }
  });

  subscription.on('message', async (message) => {
    try {
      console.log('[DEBUG] Received Pub/Sub message:', message.id);
      
      let logEntry;
      try {
        const data = Buffer.from(message.data, 'base64').toString();
        logEntry = JSON.parse(data);
      } catch (parseError) {
        console.error('[DEBUG] Failed to parse message:', parseError);
        message.ack(); // Acknowledge invalid messages to avoid reprocessing
        return;
      }

      await processLogEntry(logEntry);
      
      message.ack();
      console.log('[DEBUG] Successfully processed message:', message.id);
    } catch (error) {
      console.error('[DEBUG] Error processing message:', {
        messageId: message.id,
        error: error.message || 'Unknown error',
        stack: error.stack
      });
      // Only nack if it's a processing error, not a parsing error
      message.nack(); 
    }
  });

  subscription.on('error', (error) => {
    console.error('[DEBUG] Subscription error:', error);
  });

  console.log('[DEBUG] Started listening for Pub/Sub messages on:', subscriptionName);
}