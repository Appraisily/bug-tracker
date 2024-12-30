# Bug Tracker Service

A centralized error tracking service for Google Cloud Run applications that automatically captures and logs errors from Cloud Logging into a Google Sheets spreadsheet. The service uses Secret Manager for secure configuration and implements robust error handling and logging.

## Overview

The Bug Tracker service listens to Cloud Logging entries across all services in the project and automatically records any ERROR or CRITICAL severity logs into a designated Google Sheets document for easy tracking and analysis.

## Current Implementation

The service is structured into several focused modules:

- `src/index.js`: Main application entry point
  - Sets up HTTP server for health checks
  - Initializes configuration
  - Handles Pub/Sub message processing

- `src/config.js`: Configuration management
  - Manages Secret Manager integration
  - Provides secure access to spreadsheet ID
  - Implements singleton pattern for configuration

- `src/logging.js`: Log processing logic
  - Processes incoming log entries
  - Extracts relevant error information

- `src/sheets.js`: Google Sheets integration
  - Handles spreadsheet operations
  - Manages sheet creation and updates
  - Implements error logging

## Prerequisites

- Google Cloud Project with Cloud Run services
- Google Service Account with the following permissions:
  - `logging.subscriptions.create`
  - `logging.sinks.create`
  - `sheets.spreadsheets.edit`
- Google Sheets API enabled
- Google Cloud Logging API enabled

## Configuration

### Environment Variables
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure the following environment variables:
```bash
PORT=8080
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Secret Manager Configuration
The service requires the following secret:
- `SHEETS_ID_BUG_TRACKER`: The ID of the Google Sheet used for error logging

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

```bash
├── src/
│   ├── index.js        # Main entry point and Pub/Sub handling
│   ├── config.js       # Configuration and Secret Manager integration
│   ├── logging.js      # Log entry processing
│   └── sheets.js       # Google Sheets operations
├── .env.example        # Example environment variables
├── Dockerfile          # Docker configuration
├── package.json        # Project dependencies
└── README.md          # This documentation
```

## Error Handling

The service implements comprehensive error handling:
- Detailed debug logging throughout the application
- Graceful handling of Secret Manager failures
- Retry logic for Pub/Sub message processing
- Proper error propagation and logging

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