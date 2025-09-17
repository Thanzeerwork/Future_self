# Google Sign-In Setup Guide

## Step 1: Get Web Client ID from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `futureself-d8e32`
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. In the **Web SDK configuration** section, copy the **Web client ID**
6. It should look like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

## Step 2: Update Google Sign-In Configuration

1. Open `src/config/googleSignIn.js`
2. Replace `YOUR_WEB_CLIENT_ID` with your actual Web Client ID:

```javascript
GoogleSignin.configure({
  webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID_HERE', // Replace this
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});
```

## Step 3: Test Google Sign-In

1. Run your app: `npm start`
2. Try signing in with Google on both Login and SignUp screens
3. The app will automatically create a user profile with the selected role

## Features Implemented

✅ **Google Sign-In for Login**: Users can sign in with existing Google accounts
✅ **Google Sign-Up**: Users can create new accounts with Google (role selection applies)
✅ **Automatic Profile Creation**: Google users get profiles created automatically
✅ **Role Support**: Google sign-up respects the selected role (Student/Mentor/Admin)
✅ **Error Handling**: Proper error messages for failed Google authentication

## Troubleshooting

- Make sure you've enabled Google as a sign-in provider in Firebase Console
- Ensure the Web Client ID is correct
- For Android: Make sure you have Google Play Services installed
- For iOS: Make sure you have the proper iOS configuration in Firebase
