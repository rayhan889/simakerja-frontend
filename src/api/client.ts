import axios, {type InternalAxiosRequestConfig, AxiosError} from 'axios';
import { toast } from 'sonner';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN', 
    xsrfHeaderName: 'X-XSRF-TOKEN',
})

// Runs before every request is sent
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (import.meta.env.DEV) {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Runs after every response is received
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            toast.error("Session expired. Please log in again.")
            // Prevent redirect loop
            if (!window.location.pathname.includes('login')) {

                window.location.href = '/login?session_expired=true';
            }
        }

        if (error.response?.status === 403) {
            toast.error("Access Denied: insufficient permissions to access this resource.")
            console.error("Access Denied: insufficient permissions to access this resource.");
        }

        return Promise.reject(error);
    }
)