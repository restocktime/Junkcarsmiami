#!/bin/bash

# Buy Junk Car Miami Admin Backend Setup Script
echo "🚗 Setting up Buy Junk Car Miami Admin Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create necessary directories
echo "📁 Creating backup directories..."
mkdir -p backups

# Set proper permissions
echo "🔒 Setting permissions..."
chmod +x server.js

# Generate a secure JWT secret if not set
if [ -z "$JWT_SECRET" ]; then
    echo "🔐 Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo "JWT_SECRET=$JWT_SECRET" > .env
    echo "✅ JWT secret generated and saved to .env file"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the server: npm start"
echo "2. Or for development: npm run dev"
echo "3. Server will run on http://localhost:3001"
echo "4. Access admin at your-site.com/admin/"
echo ""
echo "🔑 Admin Credentials:"
echo "   Username: admin"
echo "   Password: BuyJunkCarMiami2024!"
echo ""
echo "⚠️  For production deployment:"
echo "1. Set environment variables (PORT, JWT_SECRET, NODE_ENV)"
echo "2. Use a reverse proxy (nginx recommended)"
echo "3. Enable SSL/HTTPS"
echo "4. Use PM2 for process management"
echo ""
echo "📚 See README.md for detailed instructions"