"use client";

import { createContext, useContext } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  rawUser: any;
}

interface AuthContextType {
  user: AppUser | null;
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
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, redirectToSignIn } = useClerk();

  const user: AppUser | null = clerkUser
    ? {
        uid: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        displayName:
          clerkUser.fullName ||
          clerkUser.username ||
          clerkUser.firstName ||
          null,
        photoURL: clerkUser.imageUrl || null,
        rawUser: clerkUser,
      }
    : null;

  const loading = !isLoaded;

  const signInWithGoogle = async () => {
    try {
      await redirectToSignIn({ redirectUrl: "/dashboard" });
    } catch (error) {
      console.error("Error starting sign in", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirectUrl: "/login" });
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
