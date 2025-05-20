#!/bin/bash

# Integration tests for the API using curl
# Run this after starting the server with `pnpm --filter simple-rag-app-api dev`

API_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Function to run a test
run_test() {
  local name=$1
  local command=$2
  local expected_status=$3
  local expected_content=$4

  echo "Running test: $name"
  
  # Run the command and capture output and status code
  local output=$(eval $command)
  local status=$?
  
  # Check status code if provided
  if [ ! -z "$expected_status" ] && [ $status -ne $expected_status ]; then
    echo "❌ FAILED: Expected status $expected_status, got $status"
    FAILED=$((FAILED+1))
    return
  fi
  
  # Check content if provided
  if [ ! -z "$expected_content" ] && [[ ! "$output" == *"$expected_content"* ]]; then
    echo "❌ FAILED: Output does not contain expected content"
    echo "Expected to contain: $expected_content"
    echo "Got: $output"
    FAILED=$((FAILED+1))
    return
  fi
  
  echo "✅ PASSED"
  PASSED=$((PASSED+1))
}

# Test root endpoint
run_test "Root endpoint" "curl -s $API_URL/" 0 '"root":true'

# Test health endpoint
run_test "Health endpoint" "curl -s $API_URL/health/" 0 '"status":"ok"'

# Test sources listing (may be empty if no files uploaded)
run_test "Sources listing" "curl -s $API_URL/sources/" 0 '"files":'

# Test uploading a non-zip file (should fail)
run_test "Upload non-zip file" "curl -s -F 'file=@README.md' $API_URL/sources/" 0 '"error":'

# Print summary
echo "-----------------------------"
echo "Tests completed: $((PASSED+FAILED))"
echo "Passed: $PASSED"
echo "Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
  echo "All tests passed! 🎉"
  exit 0
else
  echo "Some tests failed! 😢"
  exit 1
fi
