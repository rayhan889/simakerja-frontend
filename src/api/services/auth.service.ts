import type { AuthUser, ApiResponse } from "@/types/auth.types";
import { apiClient } from "@/api/client";
import { AxiosError } from "axios";

export const authService = {

    getCurrentUser: async (): Promise<AuthUser | null> => {
        try {
          const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
          return response.data.data;
        } catch (error) {
          if (error instanceof AxiosError && error.response?.status === 401) {
            return null;
          }
          throw error
        }
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    getGoogleLoginUrl: (): string => {
        return '/oauth2/authorization/google'
    },

    checkSession: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/check');
      return true;
    } catch {
      return false;
    }
  },
}