import dotenv from 'dotenv';
import { Logging } from '@google-cloud/logging';
import { processLogEntry } from './logging.js';

dotenv.config();

const logging = new Logging();
const filter = 'severity >= ERROR';

const subscription = logging.subscription('bug-tracker-errors');

subscription.on('message', async (message) => {
  if (message.data.severity === 'ERROR' || message.data.severity === 'CRITICAL') {
    await processLogEntry(message.data);
  }
  message.ack();
});
