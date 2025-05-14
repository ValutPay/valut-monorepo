"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "@/hooks/useForm";
import { LoginFormValues } from "@/lib/types";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { login, isLoading } = useAuth();
  const { values, handleChange } = useForm<LoginFormValues>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(values.email, values.password);
  };

  return (
    <form 
      className={cn("flex flex-col gap-6 w-full", className)} 
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground max-w-xs">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-5 w-full">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            value={values.email}
            onChange={handleChange}
            required
            className="h-12 px-4 rounded-xl" 
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            value={values.password}
            onChange={handleChange}
            required
            className="h-12 px-4 rounded-xl" 
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 mt-2 rounded-xl font-medium text-base" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-pulse">Loading</span>
              <span className="animate-pulse delay-100">.</span>
              <span className="animate-pulse delay-200">.</span>
              <span className="animate-pulse delay-300">.</span>
            </>
          ) : (
            "Login"
          )}
        </Button>
      </div>
      <div className="text-center text-sm pt-4 border-t border-gray-100 mt-2">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium underline-offset-4 hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  );
} 