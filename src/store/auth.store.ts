import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthState, AuthUser } from '@/types/auth.types';
import { authService } from '@/api/services/auth.service';
import { setAccessToken } from '@/api/client';

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isInitialized: false,

            initialize: async () => {
                if (get().isLoading) return;

                set({isLoading: true, error: null});
                try {

                    const result = await authService.refreshToken();

                    if (result) {
                        setAccessToken(result.accessToken);
                        set({
                            user: result.user,
                            isLoading: false,
                            isAuthenticated: !!result.user,
                            isInitialized: true,
                            error: null
                        });
                    } else {
                        setAccessToken(null);
                        set({
                            user: null,
                            isLoading: false,
                            isAuthenticated: false,
                            isInitialized: true,
                            error: null
                        });
                    }

                } catch (error) {
                    console.error('Error during initialization:', error);
                    setAccessToken(null);

                    set({
                        user: null,
                        isLoading: false,
                        isAuthenticated: false,
                        isInitialized: true,
                        error: null
                    });
                }
            },

            updateFields: (fields: Partial<AuthUser>) => {
                const currentUser = get().user;

                if (!currentUser) return;

                set({
                    user: {
                        ...currentUser,
                        ...fields
                    }
                });
            },

            loginWithGoogle: () => {
                const loginUrl = authService.getGoogleLoginUrl();
                window.location.href = loginUrl;
            },

            logout: async () => {
                set({isLoading: true, error: null});

                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Error during logout:', error);
                } finally {
                    setAccessToken(null);
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    })
                }
            },

            setError: (error: string | null) => {
                set({ error });
            }
        }),
        {
            name: 'simakerja-auth',
            storage: createJSONStorage(() => localStorage),

            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            })
        }
    )
)
