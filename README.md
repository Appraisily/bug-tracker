# Bug Tracker Service

A centralized error tracking service for Google Cloud Run applications that automatically captures and logs errors from Cloud Logging into a Google Sheets spreadsheet.

## Overview

The Bug Tracker service listens to Cloud Logging entries across all services in the project and automatically records any ERROR or CRITICAL severity logs into a designated Google Sheets document for easy tracking and analysis.

## Prerequisites

- Google Cloud Project with Cloud Run services
- Google Service Account with the following permissions:
  - `logging.subscriptions.create`
  - `logging.sinks.create`
  - `sheets.spreadsheets.edit`
- Google Sheets API enabled
- Google Cloud Logging API enabled

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure the following environment variables:
```
PORT=8080
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=your-spreadsheet-id
```

## Google Sheets Structure

The service automatically creates a sheet named "Errors" with the following columns:
- Timestamp
- Service
- Severity
- Error Message
- Stack Trace
- Metadata

## Deployment

### Using Docker

```bash
docker build -t bug-tracker .
docker run -p 8080:8080 --env-file .env bug-tracker
```

### Using Cloud Run

```bash
gcloud run deploy bug-tracker \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

## Cloud Logging Setup

1. Create a Pub/Sub subscription for error logs:
```bash
gcloud logging sinks create bug-tracker-errors \
  pubsub.googleapis.com/projects/YOUR_PROJECT_ID/topics/bug-tracker-errors \
  --log-filter="severity >= ERROR"
```

2. Grant the service account permission to receive messages:
```bash
gcloud pubsub subscriptions add-iam-policy-binding bug-tracker-errors \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/pubsub.subscriber"
```

## Architecture

The service works by:
1. Subscribing to Cloud Logging entries via Pub/Sub
2. Filtering for ERROR and CRITICAL severity logs
3. Processing log entries to extract relevant information
4. Saving the processed data to a Google Sheets document

## Files Structure

```
├── src/
│   ├── index.js        # Main application entry point
│   ├── logging.js      # Log processing logic
│   └── sheets.js       # Google Sheets integration
├── .env.example        # Example environment variables
├── Dockerfile          # Docker configuration
├── package.json        # Project dependencies
└── README.md          # This documentation
```

## Error Data Format

Each error entry in the spreadsheet includes:
- **Timestamp**: When the error occurred
- **Service**: Name of the service that generated the error
- **Severity**: ERROR or CRITICAL
- **Error Message**: The main error message
- **Stack Trace**: Full stack trace if available
- **Metadata**: Additional context including:
  - Service labels
  - Trace ID
  - Span ID
  - Resource labels