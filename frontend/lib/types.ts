// Auth Types
export interface AuthError {
  message: string;
}

export interface AuthUser {
  email: string;
  uid: string;
}

// Form Types
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues extends LoginFormValues {
  confirmPassword: string;
} 