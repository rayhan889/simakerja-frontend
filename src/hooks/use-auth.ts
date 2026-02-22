import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/user.type";
import { useEffect } from "react";

export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const isInitialized = useAuthStore((state) => state.isInitialized);

    const initialize = useAuthStore((state) => state.initialize);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    const logout = useAuthStore((state) => state.logout);
    const setError = useAuthStore((state) => state.setError);

    return {
        // State
        user, 
        isAuthenticated,
        isLoading,
        error,
        isInitialized,

        // Actions
        initialize,
        loginWithGoogle,
        logout,
        setError
    }
}

export function useHasRole(...allowedRoles: UserRole[]): boolean {
    
    const user = useAuthStore((state) => state.user);
    
    if (!user) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
}

export function useAuthInitializer() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        if (!isInitialized) {
            initialize();
        }
    }, [isInitialized, initialize])

    return isInitialized;
}