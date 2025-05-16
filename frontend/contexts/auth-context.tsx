"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { signIn, signUp, signOut } from "@/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { AuthError } from "@/lib/types";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  authChecked: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
      return true;
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast({
        title: "Error",
        description: authError.message || "Failed to login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signUp(email, password);
      toast({
        title: "Success",
        description: "Your account has been created",
      });
      return true;
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast({
        title: "Error",
        description: authError.message || "Failed to create account",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast({
        title: "Success",
        description: "You have been logged out",
      });
      router.push("/login");
      return true;
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast({
        title: "Error",
        description: authError.message || "Failed to logout",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authChecked,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 