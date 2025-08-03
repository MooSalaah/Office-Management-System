#!/bin/bash

echo "=== Starting build process ==="

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Copy Render config
echo "Copying Render config..."
cp next.config.render.mjs next.config.mjs

# Build the project
echo "Building the project..."
npm run build

# Check if .next directory exists
echo "Checking build output..."
if [ -d ".next" ]; then
    echo "✅ .next directory found!"
    ls -la .next/
    echo "✅ Build successful!"
else
    echo "❌ .next directory not found!"
    echo "Current directory contents:"
    ls -la
    echo "❌ Build failed!"
    exit 1
fi

echo "=== Build completed ===" 