# Quick Fix for Google OAuth Error

## The Problem
You're getting "Access blocked: Authorization Error" because the redirect URI in Google Cloud Console doesn't match what your app is sending.

## Quick Solution

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select project: `futureself-d8e32`

### Step 2: Update OAuth Client
1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID: `362322545407-ergo9hp0itpnck8l05idubph79v6639a.apps.googleusercontent.com`

### Step 3: Add These Redirect URIs
In the **Authorized redirect URIs** section, add these exact URIs:

```
exp://192.168.1.7:8081
exp://localhost:8081
futureself://auth
```

### Step 4: Save and Test
1. Click **Save**
2. Wait 5-10 minutes for changes to propagate
3. Test Google Sign-In in your app

## Alternative: Use Web Version
If the above doesn't work, try testing on web:
1. Press `w` in your terminal to open web version
2. Test Google Sign-In there first

## Current Redirect URI
Your app is using: `futureself://auth`
Make sure this exact URI is added to Google Cloud Console.

## Still Not Working?
If you still get errors, we can switch to a different authentication method that doesn't require complex OAuth setup.
