"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { SignupForm } from "@/components/signup-form";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { isAuthenticated, authChecked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      router.push("/");
    }
  }, [authChecked, isAuthenticated, router]);

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-10 mx-auto w-full max-w-sm sm:max-w-md">
        <div className="flex justify-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="text-xl">Valut</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}