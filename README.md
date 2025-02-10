# The Catch

## Overview
The Catch is a dating app built using **React Native, TypeScript, Expo Go, and Firebase** for real-time messaging, storage, and authentication. This project tied for **1st place** in the **Software Systems Development** class.
 * Created along with [@markstubbs04](https://github.com/markstubbs04), [@MParkerP](https://github.com/MParkerP), [@rferrell03](https://github.com/rferrell03), and [@Myles82](https://github.com/Myles82).

## Screen Shots
<div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 80px;">
   <img src="https://github.com/user-attachments/assets/04a06aaa-0b35-41b0-ae5a-01bdbf9232db" alt="Chat" height="400"/>
   <img src="https://github.com/user-attachments/assets/1c028aed-546b-4674-ad18-41e2acfbd33b" alt="LandingPage" height="400"/>
   <img src="https://github.com/user-attachments/assets/00d23997-24d8-4096-b2b8-3b4718817874" alt="Registration" height="400"/>
</div>

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
<br></br>
