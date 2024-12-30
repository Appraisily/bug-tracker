import dotenv from 'dotenv';
import { PubSub } from '@google-cloud/pubsub';
import http from 'http';
import { processLogEntry } from './logging.js';
import { initializeConfig } from './config.js';

dotenv.config();

const port = process.env.PORT || 8080;

// Initialize configuration before starting server
await initializeConfig();

// Test write to sheets
try {
  console.log('[DEBUG] Performing test write to sheets');
  await processLogEntry({
    timestamp: new Date().toISOString(),
    resource: {
      type: 'test',
      labels: {}
    },
    severity: 'ERROR',
    textPayload: 'Test entry on service startup',
    labels: {},
    jsonPayload: {
      message: 'Service startup test'
    }
  });
  console.log('[DEBUG] Test write successful');
} catch (error) {
  console.error('[DEBUG] Test write failed:', error);
}

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

// Flag to track if we've processed a message
let hasProcessedMessage = false;

subscription.on('message', async (pubsubMessage) => {
  // Only process the first message
  if (hasProcessedMessage) {
    console.log('[DEBUG] Skipping message - already processed first message');
    pubsubMessage.ack();
    return;
  }

  try {
    console.log('[DEBUG] Processing first message:', {
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
    
    hasProcessedMessage = true;
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