#!/bin/bash

# Exit on any error
set -e

# --- Start Django Backend ---
echo "🔧 Setting up Django backend..."

cd server

# Start Django server in background
echo "🚀 Starting Django server..."
uv run python manage.py runserver &

# --- Start React Frontend ---
echo "🔧 Setting up React frontend..."

cd ../client

# Install frontend dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  yarn install
fi

# Start React frontend
echo "🚀 Starting React frontend..."
yarn dev
