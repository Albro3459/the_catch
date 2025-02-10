# The Catch

## Overview
The Catch is a dating app built using **React Native, TypeScript, Expo Go, and Firebase** for real-time messaging, storage, and authentication. This project tied for **1st place** in the **Software Systems Development** class.

## Installation

Follow these steps to set up and run The Catch locally:

### 1. Clone the repository
```sh
git clone https://github.com/Albro3459/the_catch.git
```

### 2. Navigate into the project directory
```sh
cd the_catch
```

### 3. Install dependencies
```sh
npm install
```

### 4. Install the Expo Go app on your phone
Download and install the Expo Go app from the App Store (iOS) or Google Play Store (Android).

### 5. Start the development server
```sh
npm start
```

### 6. Run the app on your device
- **On iPhone:** Scan the QR code with the iPhone Camera app.
- **On Android:** Open the Expo Go app and scan the QR code using the camera in the app.

## Firebase Setup
The app requires **Firebase** for real-time Firestore database, storage, and authentication. Follow these steps to configure Firebase:

### 1. Create a Firebase Account
Go to [Firebase Console](https://console.firebase.google.com/) and create a new Firebase project. Note that Firebase might require adding a payment method to enable Firestore, storage, and authentication.

### 2. Configure Firebase Credentials
After setting up Firebase, retrieve your credentials and store them in `./firebase_secrets.ts`:
 * You will need to create this file first in the project root. 
    * Make sure it is added in the .gitignore.

```typescript
export const apiKey = "...";
export const authDomain = "...";
export const projectId = "...";
export const storageBucket = "...";
export const messagingSenderId = "...";
export const appId = "...";
export const measurementId = "...";
```

Make sure that all required Firebase services are enabled and properly configured in your Firebase Console.
