#!/bin/bash

# Service URL for testing
SERVICE_URL="https://appraisals-backend-856401495068.us-central1.run.app"

# Test 1: Send malformed JSON
echo "Sending malformed JSON..."
curl -X POST "${SERVICE_URL}/api/data" \
  -H "Content-Type: application/json" \
  -d '{"malformed": true, missing_quote: "test}'

# Test 2: Request non-existent endpoint
echo -e "\n\nRequesting non-existent endpoint..."
curl "${SERVICE_URL}/not-found"

# Test 3: Send invalid parameters
echo -e "\n\nSending invalid parameters..."
curl -X POST "${SERVICE_URL}/api/calculate" \
  -H "Content-Type: application/json" \
  -d '{"invalid_param": "value"}'