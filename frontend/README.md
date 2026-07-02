# Donora Frontend Setup and Running Guide

## Prerequisites

- Node.js installed on your system
- npm (Node Package Manager) - comes with Node.js
- Expo Go app on your mobile device (Android or iOS)

## Installation Steps

### 1. Install Expo CLI Globally

```bash
npm install -g expo-cli
```

### 2. Navigate to Frontend Directory

```bash
cd c:/Users/ASUS TUF/Desktop/APIE_ADV/Donora/frontend
```

### 3. Install Dependencies

```bash
npm install
```

## Running the Application

### Start the Development Server

```bash
npm start
```

### Running on Different Platforms

#### On Physical Device

1. Download the Expo Go app from:
   - Android: Google Play Store
   - iOS: App Store
2. Scan the QR code displayed in the terminal
3. The app will load on your device

#### On Android Emulator

- Press `a` in the terminal where Expo is running
- Requires Android Studio and Android Emulator set up

#### On iOS Simulator

- Press `i` in the terminal where Expo is running
- Requires Xcode and iOS Simulator set up (macOS only)

#### On Web Browser

- Press `w` in the terminal where Expo is running
- Opens in your default web browser

## Backend Connection

The frontend is configured to connect to the backend at:

```
http://192.168.1.13:5000
```

Make sure the backend server is running before starting the frontend.

## Troubleshooting

### "npm is not recognized"

- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "expo is not recognized"

- Run `npm install -g expo-cli`
- Make sure npm is in your PATH

### Connection Issues

- Ensure backend is running on port 5000
- Check that your device and computer are on the same network
- Verify the IP address in the frontend screens matches your backend IP

## Development

- The app uses React Native with Expo
- Navigation is handled by React Navigation
- API calls use Axios
- UI components use React Native Paper
