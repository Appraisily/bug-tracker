import { PubSub } from '@google-cloud/pubsub';
import { processLogEntry } from './logging.js';

const pubsub = new PubSub();
const subscriptionName = process.env.PUBSUB_SUBSCRIPTION || 'bug-tracker-errors';
let processingMessage = false;

export async function startPubSubListener() {
  const subscription = pubsub.subscription(subscriptionName);

  subscription.on('message', async (message) => {
    if (processingMessage) {
      message.nack();
      return;
    }

    try {
      processingMessage = true;
      console.log('[DEBUG] Received Pub/Sub message:', message.id);
      
      const logEntry = JSON.parse(Buffer.from(message.data, 'base64').toString());
      await processLogEntry(logEntry);
      
      message.ack();
      console.log('[DEBUG] Successfully processed message:', message.id);
    } catch (error) {
      console.error('[DEBUG] Error processing message:', {
        messageId: message.id,
        error: error.message,
        stack: error.stack
      });
      message.nack();
    } finally {
      processingMessage = false;
    }
  });

  subscription.on('error', (error) => {
    console.error('[DEBUG] Subscription error:', error);
  });

  console.log('[DEBUG] Started listening for Pub/Sub messages on:', subscriptionName);
}