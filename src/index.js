import dotenv from 'dotenv';
import { PubSub } from '@google-cloud/pubsub';
import { processLogEntry } from './logging.js';

dotenv.config();

const pubsub = new PubSub();
const subscriptionName = 'bug-tracker-errors';

const subscription = pubsub.subscription(subscriptionName);

subscription.on('message', async (pubsubMessage) => {
  try {
    const logEntry = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
    
    if (logEntry.severity === 'ERROR' || logEntry.severity === 'CRITICAL') {
      await processLogEntry(logEntry);
    }
    pubsubMessage.ack();
  } catch (error) {
    console.error('Error processing message:', error);
    pubsubMessage.nack();
  }
});

subscription.on('error', (error) => {
  console.error('Subscription error:', error);
});
