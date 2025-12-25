import api from './api';
import type {
  UpdateProfileData,
  UpdatePasswordData,
  ProfileResponse,
  AvatarResponse,
  MessageResponse,
  AuthUser,
} from '../types/auth';
import { AxiosError } from 'axios';

export interface ProfileStats {
  total_tests: number;
  best_score: number;
  estimated_level: string;
  level_progress: number;
  recent_history: {
    id: number;
    module: string;
    date: string;
    score: number;
    level: string;
  }[];
}

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

export const profileService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthUser> {
    try {
      const { data } = await api.get<{ user: AuthUser }>('/profile');
      return data.user;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Update user profile (name, email, phone)
   */
  async updateProfile(profileData: UpdateProfileData): Promise<ProfileResponse> {
    try {
      const { data } = await api.put<ProfileResponse>('/profile', profileData);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Upload avatar image
   */
  async updateAvatar(file: File): Promise<AvatarResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await api.post<AvatarResponse>('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<MessageResponse> {
    try {
      const { data } = await api.delete<MessageResponse>('/profile/avatar');
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Update password
   */
  async updatePassword(passwordData: UpdatePasswordData): Promise<MessageResponse> {
    try {
      const { data } = await api.put<MessageResponse>('/profile/password', passwordData);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  /**
   * Get user profile statistics
   */
  async getStats(): Promise<ProfileStats> {
    try {
      const { data } = await api.get<ProfileStats>('/profile/stats');
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};

export default profileService;
