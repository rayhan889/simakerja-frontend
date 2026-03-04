import type { ApiResponse, AuthError, LoginErrorCodes } from "@/types/auth.types";
import type { AxiosError } from "axios";

export const LOGIN_ERROR_STATUSES = [401, 403, 423];

export class AuthLoginError extends Error {
    public errorCode: string | null;

    constructor({ errorCode, message }: AuthError) {
        super(message);
        this.name = 'AuthLoginError';
        this.errorCode = errorCode;
    }
}

export function extractApiError(error: AxiosError): AuthError {
 
    const data = error.response?.data as Partial<ApiResponse<unknown>>;
    
    if (data) {
        return {
            errorCode: data.errorCode as LoginErrorCodes ?? null,
            message: data.message || 'Terjadi kesalahan.'
        }
    }

    return {
        errorCode: null,
        message: error.message || 'Terjadi kesalahan jaringan.'
    }
}