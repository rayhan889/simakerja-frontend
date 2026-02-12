export type UserRole = 'student' | 'lecturer' | 'staff' | 'adhoc';

export interface User {
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
    user: User | null;
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