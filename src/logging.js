import { writeError } from './sheets.js';

function extractErrorMessage(logEntry) {
  if (logEntry.textPayload) {
    return logEntry.textPayload;
  }
  
  if (logEntry.jsonPayload) {
    // If jsonPayload has a message property, use that
    if (logEntry.jsonPayload.message) {
      return logEntry.jsonPayload.message;
    }
    // Otherwise stringify but limit size
    return JSON.stringify(logEntry.jsonPayload).slice(0, 1000);
  }
  
  return 'No error message available';
}

export async function processLogEntry(logEntry) {
  console.log('[DEBUG] Processing log entry:', {
    rawResource: logEntry.resource,
    rawLabels: logEntry.resource?.labels,
    resourceType: logEntry.resource?.type
  });

  // Determine service name based on resource type
  let service = logEntry.resource?.labels?.service_name;
  if (!service) {
    if (logEntry.resource?.type === 'build') {
      service = 'cloud-build';
    } else {
      service = logEntry.resource?.type || 'unknown';
    }
  }
  
  await writeError({
    timestamp: logEntry.timestamp,
    service,
    severity: logEntry.severity,
    errorMessage: extractErrorMessage(logEntry),
    stackTrace: logEntry.jsonPayload?.stack_trace || '',
    metadata: {
      ...logEntry.resource.labels,
      ...logEntry.labels,
      trace: logEntry.trace,
      spanId: logEntry.spanId,
      resourceType: logEntry.resource?.type
    }
  });
}