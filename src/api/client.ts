import axios, {type InternalAxiosRequestConfig, AxiosError} from 'axios';
import { toast } from 'sonner';

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
    accessToken = token
}

export const getAccessToken = () => accessToken

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

const COOKIE_ONLY_ENDPOINTS = ['/auth/refresh', '/auth/logout'];

// Runs before every request is sent
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const isCookieOnly = COOKIE_ONLY_ENDPOINTS.some(
            (endpoint) => config.url?.includes(endpoint)
        );

        if (accessToken && !isCookieOnly) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        if (import.meta.env.DEV) {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
)

let isRefreshing = false
let pendingRequests: Array<{
    resolve: (token: string) => void
    reject: (error: unknown) => void
}> = []

const processQueue = (token: string | null, error: unknown = null) => {
    pendingRequests.forEach(({ resolve, reject }) => {
        if (token) resolve(token)
        else reject(error)
    })
    pendingRequests = []
}

const clearAuthStore = async () => {
    const { useAuthStore } = await import('@/store/auth.store');
    useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    });
}

// Runs after every response is received
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
            if (isRefreshing) {
                if (import.meta.env.DEV) {
                    console.log('[API] Token refresh in progress, queuing request...')
                }
                return new Promise((resolve, reject) => {
                    pendingRequests.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                            resolve(apiClient(originalRequest))
                        },
                        reject
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true
    
            try {
                
                if (import.meta.env.DEV) {
                    console.log('[API] Attempting to refresh token...')
                }

                const { data } = await apiClient.post('/auth/refresh')
                const newToken = data.data.accessToken;
    
                setAccessToken(newToken)
                processQueue(newToken)
    
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                processQueue(null, refreshError)
                setAccessToken(null)

                await clearAuthStore();
    
                if (!window.location.pathname.includes('login')) {
                    toast.error('Session expired. Please log in again.')
                    window.location.href = '/login?session_expired=true'
                }
    
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        if (error.response?.status === 403) {
            toast.error('Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.');
        }

        return Promise.reject(error)
    }
)