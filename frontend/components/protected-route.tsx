"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, authChecked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/login");
    }
  }, [authChecked, isAuthenticated, router]);

  // If auth is still being checked, or user is not authenticated, don't render children
  if (!authChecked || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 