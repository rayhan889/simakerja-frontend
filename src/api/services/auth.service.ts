import type { AuthUser, ApiResponse, RefreshTokenResponse, AuthSuccessResponse } from "@/types/auth.types";
import { apiClient } from "@/api/client";
import { AxiosError } from "axios";
import { AuthLoginError, extractApiError, LOGIN_ERROR_STATUSES } from "../errors";

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

    refreshToken: async (): Promise<ApiResponse<RefreshTokenResponse> | null> => {
      try {
        const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh');
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
            return null;
        }
        console.error('Error refreshing token:', error);
        throw error
      }
    },

    logout: async (): Promise<void> => {
      await apiClient.post('/auth/logout');
    },

    getGoogleLoginUrl: (): string => {
        return '/oauth2/authorization/google';
    },

    login: async (
        email: string,
        password: string
    ): Promise<ApiResponse<AuthSuccessResponse> | null> => {
      try {
        const response = await apiClient.post<ApiResponse<AuthSuccessResponse>>('/auth/login', {
          email,
          password
        });
        return response.data;
      } catch (error) {
        if (
          error instanceof AxiosError &&
          error.response?.status &&
          LOGIN_ERROR_STATUSES.includes(error.response.status)
        ) {
            const authError = extractApiError(error);
            throw new AuthLoginError(authError);
        }
        console.error('Error logging in:', error);
        throw error
      }
    },

    changePassword: async (): Promise<void> => {
      await apiClient.post('/auth/change-password');
    }
}