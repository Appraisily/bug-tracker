import { saveError } from './sheets.js';

export async function processLogEntry(logEntry) {
  console.log('[DEBUG] Processing log entry:', {
    rawResource: logEntry.resource,
    rawLabels: logEntry.resource?.labels,
    serviceName: logEntry.resource?.labels?.service_name
  });

  const service = logEntry.resource.labels.service_name;
  
  if (!service) {
    console.log('[DEBUG] Service name is undefined. Full logEntry:', {
      severity: logEntry.severity,
      timestamp: logEntry.timestamp,
      resource: logEntry.resource,
      labels: logEntry.labels,
      textPayload: logEntry.textPayload,
      jsonPayload: logEntry.jsonPayload
    });
  }

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