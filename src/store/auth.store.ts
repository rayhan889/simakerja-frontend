import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type AuthState, type AuthUser, type LoginErrorCodes } from '@/types/auth.types';
import { authService } from '@/api/services/auth.service';
import { setAccessToken } from '@/api/client';
import { AuthLoginError } from '@/api/errors';

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            errorCode: null,
            isInitialized: false,

            initialize: async () => {
                if (get().isLoading) return;

                set({isLoading: true, error: null, errorCode: null});
                try {
                    const data = await authService.refreshToken();

                    if (data) {
                        setAccessToken(data.data.accessToken);
                        set({
                            user: data.data.user,
                            isLoading: false,
                            isAuthenticated: !!data.data.user,
                            isInitialized: true,
                            error: null,
                            errorCode: null
                        });
                    } else {
                        setAccessToken(null);
                        set({
                            user: null,
                            isLoading: false,
                            isAuthenticated: false,
                            isInitialized: true,
                            error: null,
                            errorCode: null
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
                        error: "Gagal memuat data pengguna",
                        errorCode: null
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
                globalThis.location.href = loginUrl;
            },

            login: async (email: string, password: string) => {
                set({isLoading: true, error: null, errorCode: null});
                try {
                    const data = await authService.login(email, password);
                    if (data) {
                        setAccessToken(data.data.accessToken);
                        set({
                            user: data.data.user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                            errorCode: null
                        });
                    } else {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: "Login gagal",
                            errorCode: null
                        });
                    }
                } catch (error) {
                    console.error('Error during login:', error);

                    if (error instanceof AuthLoginError) {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: error.message,
                            errorCode: error.errorCode as LoginErrorCodes | null,
                        });
                    } else {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: "Terjadi kesalahan saat login",
                            errorCode: null,
                        });
                    }
                }
            },

            logout: async () => {
                set({isLoading: true, error: null, errorCode: null});

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
                        error: null,
                        errorCode: null
                    })
                }
            },

            setError: (error: string | null) => {
                set({ error, errorCode: error === null ? null : get().errorCode });
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
