#!/bin/bash

set -e

# Security: Set resource limits
ulimit -t 30        # CPU time limit (30 seconds)
ulimit -f 10240     # File size limit (10MB)
ulimit -v 268435456 # Virtual memory limit (256MB) - increased for C++
ulimit -n 50        # Max open files
ulimit -u 50        # Max user processes

# Handle direct execution mode (when called from Docker executor)
if [ $# -eq 0 ]; then
    # Legacy JSON mode for backward compatibility
    input=$(cat)
    code=$(echo "$input" | jq -r '.code // ""')
    test_input=$(echo "$input" | jq -r '.input // ""')
    
    if [ -z "$code" ]; then
        echo '{"success": false, "output": "", "error": "No code provided"}'
        exit 0
    fi
    
    echo "$code" > /app/solution.cpp
    echo "$test_input" > /app/input.txt
fi

# Check if solution file exists
if [ ! -f "/app/solution.cpp" ]; then
    echo "Error: solution.cpp not found"
    exit 1
fi

# Create unique identifiers to avoid conflicts
timestamp=$(date +%s%N)
executable="/tmp/solution_${timestamp}"

# Compile C++ code with optimized flags
compile_start=$(date +%s%N)
compile_output=$(g++ -std=c++17 -Wall -Wextra -O2 \
    -fstack-protector-strong -D_FORTIFY_SOURCE=2 \
    -fno-exec-stack -fPIE -pie \
    -static-libgcc -static-libstdc++ \
    /app/solution.cpp -o "$executable" 2>&1) || {
    
    # Clean compilation error output
    clean_error=$(echo "$compile_output" | sed 's|/app/solution.cpp|solution.cpp|g' | head -20)
    
    if [ $# -eq 0 ]; then
        echo "{\"success\": false, \"output\": \"\", \"error\": \"Compilation Error: $clean_error\"}"
    else
        echo "Compilation Error: $clean_error"
    fi
    rm -f "$executable"
    exit 1
}
compile_end=$(date +%s%N)
compile_time=$(( (compile_end - compile_start) / 1000000 ))

# Set executable permissions
chmod +x "$executable"

# Prepare input
if [ -f "/app/input.txt" ]; then
    input_data=$(cat /app/input.txt)
else
    input_data=""
fi

# Execute with timeout and capture output
exec_start=$(date +%s%N)
timeout 30s bash -c "echo '$input_data' | $executable" > /tmp/output.txt 2>&1 || {
    exit_code=$?
    exec_end=$(date +%s%N)
    exec_time=$(( (exec_end - exec_start) / 1000000 ))
    
    if [ $exit_code -eq 124 ]; then
        if [ $# -eq 0 ]; then
            echo '{"success": false, "output": "", "error": "Time Limit Exceeded (30s)", "compilationTime": '$compile_time', "executionTime": 30000}'
        else
            echo "Time Limit Exceeded (30s)"
        fi
    else
        error_output=$(cat /tmp/output.txt 2>/dev/null | head -100 || echo "Runtime Error")
        if [ $# -eq 0 ]; then
            echo "{\"success\": false, \"output\": \"\", \"error\": \"Runtime Error: $error_output\", \"compilationTime\": $compile_time, \"executionTime\": $exec_time}"
        else
            echo "Runtime Error: $error_output"
        fi
    fi
    rm -f "$executable" /tmp/output.txt
    exit $exit_code
}
exec_end=$(date +%s%N)
exec_time=$(( (exec_end - exec_start) / 1000000 ))

# Get output
output=$(cat /tmp/output.txt 2>/dev/null || echo "")

# Clean up
rm -f "$executable" /tmp/output.txt

# Return success result
if [ $# -eq 0 ]; then
    # JSON mode
    output_escaped=$(echo "$output" | sed 's/"/\\"/g' | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$//')
    echo "{\"success\": true, \"output\": \"$output_escaped\", \"error\": \"\", \"compilationTime\": $compile_time, \"executionTime\": $exec_time}"
else
    # Direct output mode
    echo "$output"
fi
