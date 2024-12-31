import { writeError } from '../services/sheets/index.js';

function extractErrorMessage(logEntry) {
  const message = [];

  if (logEntry.textPayload?.trim()) {
    message.push(logEntry.textPayload.trim());
  }
  
  if (logEntry.jsonPayload) {
    const { message: jsonMessage, error, errorMessage } = logEntry.jsonPayload;
    if (jsonMessage) message.push(jsonMessage);
    if (error) message.push(error);
    if (errorMessage) message.push(errorMessage);
  }

  return message.length > 0 
    ? message.join(' | ').slice(0, 1000)
    : 'No error message available';
}

export async function processLogEntry(logEntry) {
  console.log('[DEBUG] Processing log entry:', JSON.stringify(logEntry, null, 2));

  const service = logEntry.resource?.labels?.service_name
    || (logEntry.resource?.type === 'build' ? 'cloud-build' : logEntry.resource?.type)
    || 'unknown';
  
  await writeError({
    timestamp: logEntry.timestamp,
    service,
    severity: logEntry.severity,
    errorMessage: extractErrorMessage(logEntry),
    stackTrace: logEntry.jsonPayload?.stack_trace || '',
    metadata: {
      insertId: logEntry.insertId,
      ...logEntry.resource?.labels,
      ...logEntry.labels,
      trace: logEntry.trace,
      spanId: logEntry.spanId,
      resourceType: logEntry.resource?.type
    }
  });
}