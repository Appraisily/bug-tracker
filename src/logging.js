import { saveError } from './sheets.js';

export async function processLogEntry(logEntry) {
  const service = logEntry.resource.labels.service_name;
  await saveError({
    timestamp: logEntry.timestamp,
    service,
    severity: logEntry.severity,
    errorMessage: logEntry.textPayload || JSON.stringify(logEntry.jsonPayload),
    stackTrace: logEntry.jsonPayload?.stack_trace || '',
    metadata: JSON.stringify({
      ...logEntry.resource.labels,
      ...logEntry.labels,
      trace: logEntry.trace,
      spanId: logEntry.spanId
    })
  });
}