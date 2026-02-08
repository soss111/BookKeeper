#!/bin/bash

echo "================================================"
echo "  BookKeeper - Starting Application"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "First time setup detected..."
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting BookKeeper..."
echo ""
echo "The app will open in your browser automatically."
echo "Press Ctrl+C to stop the server."
echo ""

npm run dev
