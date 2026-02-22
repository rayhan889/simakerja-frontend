import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthState, AuthUser } from '@/types/auth.types';
import { authService } from '@/api/services/auth.service';

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

                    // api call
                    const user = await authService.getCurrentUser();

                    set({
                        user,
                        isLoading: false,
                        isAuthenticated: !!user,
                        isInitialized: true,
                        error: null
                    });
                } catch (error) {
                    console.error('Error during initialization:', error);

                    set({
                        user: null,
                        isLoading: false,
                        isAuthenticated: false,
                        isInitialized: true,
                        error: null
                    });
                } finally {
                    set({isLoading: false});
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
