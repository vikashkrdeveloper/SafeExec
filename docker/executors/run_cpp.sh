#!/bin/bash

set -e

# Security: Set resource limits
ulimit -t 30        # CPU time limit (30 seconds)
ulimit -f 10240     # File size limit (10MB)
ulimit -v 134217728 # Virtual memory limit (128MB)
ulimit -n 50        # Max open files
ulimit -u 50        # Max user processes

# Read JSON input from stdin
input=$(cat)

# Parse JSON to extract code and input
code=$(echo "$input" | jq -r '.code // ""')
test_input=$(echo "$input" | jq -r '.input // ""')

# Validate code
if [ -z "$code" ]; then
    echo '{"success": false, "output": "", "error": "No code provided"}'
    exit 0
fi

# Create temporary file
temp_file="/tmp/solution_$(date +%s%N).cpp"
executable="/tmp/solution_$(date +%s%N)"

# Write code to file
echo "$code" > "$temp_file"

# Compile with security flags
compile_output=$(g++ -std=c++17 -Wall -Wextra -O2 \
    -fstack-protector-strong -D_FORTIFY_SOURCE=2 \
    -fno-exec-stack -fPIE -pie \
    "$temp_file" -o "$executable" 2>&1) || {
    
    echo "{\"success\": false, \"output\": \"\", \"error\": \"Compilation Error: $compile_output\"}"
    rm -f "$temp_file" "$executable"
    exit 0
}

# Execute with timeout and capture output
timeout 30s bash -c "echo '$test_input' | $executable" > /tmp/output.txt 2>&1 || {
    exit_code=$?
    if [ $exit_code -eq 124 ]; then
        echo '{"success": false, "output": "", "error": "Time Limit Exceeded"}'
    else
        error_output=$(cat /tmp/output.txt 2>/dev/null || echo "Runtime Error")
        echo "{\"success\": false, \"output\": \"\", \"error\": \"Runtime Error: $error_output\"}"
    fi
    rm -f "$temp_file" "$executable" /tmp/output.txt
    exit 0
}

# Get output
output=$(cat /tmp/output.txt 2>/dev/null || echo "")

# Clean up
rm -f "$temp_file" "$executable" /tmp/output.txt

# Return success result
echo "{\"success\": true, \"output\": \"$output\", \"error\": \"\"}"
