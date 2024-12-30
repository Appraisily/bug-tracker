import dotenv from 'dotenv';
import { PubSub } from '@google-cloud/pubsub';
import http from 'http';
import { processLogEntry } from './logging.js';
import { initializeConfig } from './config.js';

dotenv.config();

const port = process.env.PORT || 8080;

// Initialize configuration before starting server
await initializeConfig();

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const pubsub = new PubSub();
const subscriptionName = 'bug-tracker-errors';

const subscription = pubsub.subscription(subscriptionName);

subscription.on('message', async (pubsubMessage) => {
  try {
    console.log('[DEBUG] Received message:', {
      id: pubsubMessage.id,
      publishTime: pubsubMessage.publishTime,
      orderingKey: pubsubMessage.orderingKey,
      deliveryAttempt: pubsubMessage.deliveryAttempt
    });
    
    const logEntry = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
    console.log('[DEBUG] Parsed log entry:', {
      severity: logEntry.severity,
      service: logEntry.resource?.labels?.service_name,
      timestamp: logEntry.timestamp,
      insertId: logEntry.insertId,
      receiveTimestamp: logEntry.receiveTimestamp
    });
    
    if (logEntry.severity === 'ERROR' || logEntry.severity === 'CRITICAL') {
      console.log('[DEBUG] Processing error log entry');
      await processLogEntry(logEntry);
      console.log('[DEBUG] Successfully processed error log entry:', {
        messageId: pubsubMessage.id,
        service: logEntry.resource?.labels?.service_name,
        timestamp: logEntry.timestamp
      });
    }
    pubsubMessage.ack();
  } catch (error) {
    console.error('[DEBUG] Error processing message:', {
      error: error.message,
      stack: error.stack,
      messageId: pubsubMessage.id,
      deliveryAttempt: pubsubMessage.deliveryAttempt
    });
    pubsubMessage.nack();
  }
});

subscription.on('error', (error) => {
  console.error('Subscription error:', error);
});