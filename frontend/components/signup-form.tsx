"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "@/hooks/useForm";
import { SignupFormValues } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const { register, isLoading } = useAuth();
  const { values, handleChange } = useForm<SignupFormValues>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (values.password !== values.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    await register(values.email, values.password);
  };

  return (
    <form 
      className={cn("flex flex-col gap-6 w-full", className)} 
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground max-w-xs">
          Enter your details below to create your account
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
            autoComplete="email"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input 
            id="password" 
            name="password"
            type="password" 
            value={values.password}
            onChange={handleChange}
            required
            className="h-12 px-4 rounded-xl" 
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground mt-1">Password must be at least 6 characters long</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
          <Input 
            id="confirm-password" 
            name="confirmPassword"
            type="password" 
            value={values.confirmPassword}
            onChange={handleChange}
            required
            className="h-12 px-4 rounded-xl" 
            autoComplete="new-password"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 mt-2 rounded-xl font-medium text-base" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-pulse">Creating account</span>
              <span className="animate-pulse delay-100">.</span>
              <span className="animate-pulse delay-200">.</span>
              <span className="animate-pulse delay-300">.</span>
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </div>
      <div className="text-center text-sm pt-4 border-t border-gray-100 mt-2">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
          Login
        </Link>
      </div>
    </form>
  );
}