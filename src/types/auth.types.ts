import type { UserRole } from "./user.type";

export interface AuthUser {
    id: string;
    sub: string;
    email: string;
    profilePicture: string;
    role: UserRole;
    fullName: string;
    nim?: string;
    nip?: string
    studyProgram?: string;
    phoneNumber?: string;
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
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}