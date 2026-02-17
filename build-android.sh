#!/bin/bash
# Build and generate Android APK in one command
# Usage: bash build-android.sh

set -e

echo "📦 Building web assets..."
npm run build

echo "🔄 Syncing with Capacitor..."
npx cap sync android

echo "🤖 Building Android APK..."
cd android
./gradlew assembleDebug
cd ..

APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo "✅ APK ready: $APK_PATH"
else
  echo "❌ Build failed"
  exit 1
fi
