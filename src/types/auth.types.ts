import type { UserRole } from "./user.type";

type AuthStatus = 'active' | 'inactive' | 'suspended';

export interface AuthUser {
    id: string;
    email: string;
    profilePicture: string;
    role: UserRole;
    fullName: string;
    nim?: string;
    nip?: string
    studyProgram?: string;
    phoneNumber?: string;
    status: AuthStatus;
}

export interface RefreshTokenResponse {
    accessToken: string;
    user: AuthUser;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized?: boolean;

    initialize: () => Promise<void>;
    loginWithGoogle: () => void;
    logout: () => Promise<void>;
    setError: (error: string | null) => void;
    updateFields: (fields: Partial<AuthUser>) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}