import dotenv from 'dotenv';
import { PubSub } from '@google-cloud/pubsub';
import http from 'http';
import { processLogEntry } from './logging.js';

dotenv.config();

const port = process.env.PORT || 8080;

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

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