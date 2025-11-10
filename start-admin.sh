#!/bin/bash

# Start Admin Backend Server
# This script starts the backend server for the Buy Junk Car Miami admin portal

echo "🚀 Starting Buy Junk Car Miami Admin Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the backend server in background
echo "🔧 Starting backend server..."
nohup npm start > server.log 2>&1 &
BACKEND_PID=$!

# Go back to main directory and start HTTP server
cd ..
echo "🌐 Starting HTTP server for admin interface..."
echo ""
echo "✅ Admin Portal: http://localhost:8000/admin/"
echo "🔗 Backend API: http://localhost:3001"
echo "👤 Login: admin / BuyJunkCarMiami2024!"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "----------------------------------------"

# Trap to kill backend when this script exits
trap "kill $BACKEND_PID 2>/dev/null" EXIT

# Start HTTP server (this will keep the script running)
python3 -m http.server 8000
