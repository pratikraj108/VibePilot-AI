"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] Mounting AuthProvider. Initializing listeners...");

    // 1. Subscribe to auth state changes to keep user state in sync
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("[AuthContext] onAuthStateChanged fired. User ID:", currentUser ? currentUser.uid : "null");
      setUser(currentUser);
    });

    // 2. Wait for Firebase to finish initializing and restoring the session
    auth.authStateReady()
      .then(() => {
        console.log("[AuthContext] authStateReady resolved. Current user in auth object:", auth.currentUser ? auth.currentUser.uid : "null");
        setLoading(false);
      })
      .catch((error) => {
        console.error("[AuthContext] authStateReady check failed:", error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      if (error?.code === "auth/popup-blocked") {
        // Fallback to redirect if popup is blocked
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
