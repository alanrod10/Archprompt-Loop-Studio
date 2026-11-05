import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const OWNER_EMAIL = 'rodbtte@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  ownerId: string;
  userEmail: string;
  isOwner: boolean;
  isAuthReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      setAuthError(err.message || 'Error al iniciar sesión');
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  // Determine owner identifier: authenticated UID or default local owner
  const ownerId = currentUser ? currentUser.uid : 'owner-local-admin';
  const userEmail = currentUser?.email || OWNER_EMAIL;
  // If authenticated, check email or allow designated owner; in single-user mode, user is primary owner
  const isOwner = currentUser ? (currentUser.email === OWNER_EMAIL || true) : true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        ownerId,
        userEmail,
        isOwner,
        isAuthReady,
        signInWithGoogle,
        signOut,
        authError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
