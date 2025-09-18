import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../../firebase.config';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithCredential } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { USER_ROLES } from '../constants/roles';
import googleAuthConfig from '../config/googleSignIn';
import * as AuthSession from 'expo-auth-session';
import ImageUploadService from '../services/imageUploadService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            // Create user profile if it doesn't exist
            const newUserProfile = {
              uid: user.uid,
              email: user.email,
              role: USER_ROLES.STUDENT, // Default role
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            
            await setDoc(userDocRef, newUserProfile);
            setUserProfile(newUserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, role = USER_ROLES.STUDENT) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile
      const userProfile = {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, userProfile);
      
      setUserProfile(userProfile);
    } catch (error) {
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };


  const updateProfile = async (updates) => {
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // If updating profile image, handle old image deletion
      if (updates.profileImageUrl && userProfile?.profileImageUrl) {
        // Only delete if the old URL is different and is a Firebase Storage URL
        if (updates.profileImageUrl !== userProfile.profileImageUrl && 
            userProfile.profileImageUrl.startsWith('https://firebasestorage.googleapis.com')) {
          try {
            await ImageUploadService.deleteImage(userProfile.profileImageUrl);
          } catch (deleteError) {
            console.warn('Failed to delete old profile image:', deleteError);
            // Don't throw error for deletion failures
          }
        }
      }
      
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (role = USER_ROLES.STUDENT) => {
    try {
      // For now, let's use a simpler approach with a web-based OAuth
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleAuthConfig.clientId}&` +
        `redirect_uri=${encodeURIComponent(googleAuthConfig.redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(googleAuthConfig.scopes.join(' '))}&` +
        `access_type=offline&` +
        `prompt=select_account`;

      // Open the browser for Google authentication
      const result = await AuthSession.startAsync({
        authUrl: authUrl,
        returnUrl: googleAuthConfig.redirectUri,
      });

      if (result.type === 'success' && result.params.code) {
        // Exchange the authorization code for an access token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: googleAuthConfig.clientId,
            code: result.params.code,
            redirectUri: googleAuthConfig.redirectUri,
            extraParams: {},
          },
          googleAuthConfig.discovery
        );

        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        // Create a Google credential with the access token
        const googleCredential = GoogleAuthProvider.credential(tokenResponse.idToken);
        
        // Sign-in the user with the credential
        const userCredential = await signInWithCredential(auth, googleCredential);
        const user = userCredential.user;
        
        // Check if user profile exists, if not create one
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const userProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userInfo.name,
            photoURL: user.photoURL || userInfo.picture,
            role: role,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          await setDoc(userDocRef, userProfile);
          setUserProfile(userProfile);
        }
        
        return userCredential;
      } else {
        throw new Error('Google authentication was cancelled or failed');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signUpWithGoogle = async (role = USER_ROLES.STUDENT) => {
    // For Google sign-up, we use the same method as sign-in
    // since Google handles the account creation
    return await signInWithGoogle(role);
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    signOut: signOutUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
