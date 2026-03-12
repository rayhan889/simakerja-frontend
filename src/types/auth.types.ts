import type { UserRole } from "./user.type";

type AuthStatus = 'active' | 'inactive' | 'suspended';

export type LoginErrorCodes = 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'USER_NOT_FOUND' | 'UNKNOWN_ERROR' | 'FORBIDDEN';

export interface AuthError {
    errorCode: LoginErrorCodes | null;
    message: string;
}

export interface AuthUser {
    id: string;
    email: string;
    profilePicture: string;
    role: UserRole;
    fullName: string;
    nim?: string;
    nip?: string;
    nidn?: string;
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
    errorCode: LoginErrorCodes | null;
    isInitialized?: boolean;

    initialize: () => Promise<void>;
    loginWithGoogle: () => void;
    logout: () => Promise<void>;
    setError: (error: string | null) => void;
    updateFields: (fields: Partial<AuthUser>) => void;
    login: (email: string, password: string) => Promise<void>;
}

export interface AuthSuccessResponse {
    accessToken: string;
    user: AuthUser;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  errorCode?: string;
}