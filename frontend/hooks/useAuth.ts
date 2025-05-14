"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { signIn, signUp, signOut } from "@/firebase/auth";
import { AuthError } from "@/lib/types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";

export function useAuth() {
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
      // Don't redirect here - let the auth state listener handle it
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
      // Don't redirect here - let the auth state listener handle it
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

  return {
    login,
    register,
    logout,
    user,
    isAuthenticated,
    authChecked,
    isLoading
  };
} 