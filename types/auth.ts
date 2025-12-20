export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdatePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ProfileResponse {
  message: string;
  user: AuthUser;
  email_verification_required?: boolean;
}

export interface AvatarResponse {
  message: string;
  user: AuthUser;
  avatar_url: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface LoginResponse extends AuthResponse {
  email_verified?: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export type AuthModalMode = 'login' | 'register' | 'forgot-password';
