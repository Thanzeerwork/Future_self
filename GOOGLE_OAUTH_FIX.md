# Google OAuth Configuration Fix

## Current Error
- **Error**: "Access blocked: Authorization Error"
- **Error Code**: 400: invalid_request
- **Issue**: OAuth configuration mismatch

## Step 1: Update Google Cloud Console

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `futureself-d8e32` (Project ID: 362322545407)

### 1.2 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Make sure the **User Type** is set to **External**
3. Fill in the required fields:
   - **App name**: FutureSelf
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**

### 1.3 Add Authorized Domains
1. In **OAuth consent screen** → **Authorized domains**
2. Add these domains:
   - `localhost` (for development)
   - `exp.host` (for Expo)
   - `auth.expo.io` (for Expo proxy)

### 1.4 Configure OAuth Client
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID: `362322545407-ergo9hp0itpnck8l05idubph79v6639a.apps.googleusercontent.com`
3. Click on it to edit
4. In **Authorized redirect URIs**, add:
   - `https://auth.expo.io/@your-expo-username/futureself`
   - `exp://192.168.1.7:8081` (your current development server)
   - `exp://localhost:8081`

## Step 2: Get Your Expo Username

Run this command to get your Expo username:
```bash
npx expo whoami
```

If you're not logged in:
```bash
npx expo login
```

## Step 3: Update Redirect URI

Once you have your Expo username, update the redirect URI in Google Cloud Console:
- Format: `https://auth.expo.io/@YOUR_EXPO_USERNAME/futureself`

## Step 4: Test the Configuration

1. Restart your Expo development server:
   ```bash
   npm start
   ```

2. Try the Google Sign-In again

## Alternative: Use Expo's Built-in Google Auth

If the above doesn't work, we can use Expo's simpler Google authentication:

1. Install: `npx expo install expo-google-app-auth`
2. This handles all the OAuth configuration automatically

## Troubleshooting

### Common Issues:
1. **Invalid redirect URI**: Make sure the URI in Google Console matches exactly
2. **OAuth consent screen not configured**: Complete all required fields
3. **App not verified**: For testing, add your email to test users

### For Development:
- Add your email to **Test users** in OAuth consent screen
- This allows you to test without app verification

## Current Configuration
- **Client ID**: 362322545407-ergo9hp0itpnck8l05idubph79v6639a.apps.googleusercontent.com
- **Project ID**: futureself-d8e32
- **Redirect URI**: Using Expo proxy (auth.expo.io)
