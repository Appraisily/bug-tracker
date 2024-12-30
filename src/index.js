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
    console.log('[DEBUG] Received message:', pubsubMessage.id);
    const logEntry = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
    console.log('[DEBUG] Parsed log entry:', {
      severity: logEntry.severity,
      service: logEntry.resource?.labels?.service_name,
      timestamp: logEntry.timestamp
    });
    
    if (logEntry.severity === 'ERROR' || logEntry.severity === 'CRITICAL') {
      console.log('[DEBUG] Processing error log entry');
      await processLogEntry(logEntry);
      console.log('[DEBUG] Successfully processed error log entry');
    }
    pubsubMessage.ack();
  } catch (error) {
    console.error('[DEBUG] Error processing message:', {
      error: error.message,
      stack: error.stack,
      messageId: pubsubMessage.id
    });
    pubsubMessage.nack();
  }
});

subscription.on('error', (error) => {
  console.error('Subscription error:', error);
});