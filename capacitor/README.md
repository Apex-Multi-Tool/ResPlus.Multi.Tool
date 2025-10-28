# Capacitor Android wrapper (ResPlus Multi Tool Android)

This folder contains guidance to wrap the existing web frontend using Capacitor to produce an Android app.

Quick steps (developer machine):
1. Install Capacitor globally (if not installed):
   npm install -g @capacitor/cli
2. From the project root, add Capacitor:
   npx cap init "ResPlus Multi Tool" com.resplus.multitool.android
3. Build the web app
   npm run build
4. Copy the web build to Capacitor and open Android Studio:
   npx cap add android
   npx cap copy
   npx cap open android
5. From Android Studio, build and run on emulator or device.

Notes:
- This approach reuses the existing web UI with minimal changes.
- For native features, use Capacitor plugins (e.g., geolocation, file, camera).
- To keep the build CI-friendly, add a script like:
  "mobile:android:build": "npm run build && npx cap copy android"
