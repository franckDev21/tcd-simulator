import api, { tokenStorage } from './api';
import type {
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  LoginResponse,
  MessageResponse,
  AuthUser,
} from '../types/auth';
import { AxiosError } from 'axios';

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
};

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        ...credentials,
        device_name: credentials.device_name || 'web',
      });
      tokenStorage.set(data.token);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', {
        ...credentials,
        device_name: credentials.device_name || 'web',
      });
      tokenStorage.set(data.token);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStorage.remove();
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await api.post('/auth/logout-all');
    } finally {
      tokenStorage.remove();
    }
  },

  async getUser(): Promise<AuthUser> {
    try {
      const { data } = await api.get<{ user: AuthUser }>('/auth/user');
      return data.user;
    } catch (error) {
      tokenStorage.remove();
      throw new Error(extractErrorMessage(error));
    }
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    try {
      const { data } = await api.get<MessageResponse>(`/auth/verify-email/${token}`);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async resendVerification(): Promise<MessageResponse> {
    try {
      const { data } = await api.post<MessageResponse>('/auth/resend-verification');
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async forgotPassword(payload: ForgotPasswordData): Promise<MessageResponse> {
    try {
      const { data } = await api.post<MessageResponse>('/auth/forgot-password', payload);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async resetPassword(payload: ResetPasswordData): Promise<MessageResponse> {
    try {
      const { data } = await api.post<MessageResponse>('/auth/reset-password', payload);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.get();
  },
};

export default authService;
