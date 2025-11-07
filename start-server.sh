#!/bin/bash

echo "🚗 Starting Miami Junk Car Website Local Server..."
echo ""

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 server.py
elif command -v python &> /dev/null; then
    python server.py
else
    echo "❌ Error: Python is not installed or not found in PATH"
    echo "💡 Please install Python 3 and try again"
    exit 1
fi