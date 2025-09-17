import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

// Complete the auth session in the browser
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = '362322545407-ergo9hp0itpnck8l05idubph79v6639a.apps.googleusercontent.com';

const redirectUri = makeRedirectUri({
  scheme: 'futureself',
  path: 'auth',
});

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const googleAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  redirectUri,
  discovery,
  scopes: ['openid', 'profile', 'email'],
  responseType: AuthSession.ResponseType.Code,
  prompt: AuthSession.Prompt.SelectAccount,
};

export default googleAuthConfig;
