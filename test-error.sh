#!/bin/bash

# Replace SERVICE_URL with your actual Cloud Run service URL
SERVICE_URL="https://your-service-url"

# Send malformed JSON to trigger an error
curl -X POST ${SERVICE_URL}/api/data \
  -H "Content-Type: application/json" \
  -d '{"malformed_json": true, missing_quote: "test}'