import { PubSub } from '@google-cloud/pubsub';
import { getSheetsClient } from '../sheets/client.js';
import { handlePubSubMessage } from './handler.js';

const pubsub = new PubSub();
const subscriptionName = process.env.PUBSUB_SUBSCRIPTION || 'bug-tracker-errors';

export async function startPubSubListener() {
  // Initialize sheets client first
  await getSheetsClient();
  
  const subscription = pubsub.subscription(subscriptionName);

  subscription.on('message', handlePubSubMessage);

  subscription.on('error', (error) => {
    console.error('[DEBUG] Subscription error:', error);
  });

  console.log('[DEBUG] Started listening for Pub/Sub messages on:', subscriptionName);
}