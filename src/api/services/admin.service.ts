import type { ApiResponse } from "@/types/auth.types";
import type { CreatedUser } from "@/types/user.type";
import {type CreateNewUserRequest } from '../../types/admin.types';
import { AxiosError } from "axios";
import { apiClient } from "../client";
import type { PaginationResponse } from "@/types/pagination.type";
import type { QueryParams } from "@/types/table.types";

export const adminService = {

    listUsers: async (
        params: QueryParams
    ): Promise<PaginationResponse<CreatedUser> | null> => {
        try {
            const response = await apiClient.get<ApiResponse<PaginationResponse<CreatedUser>>>(
                '/admins/list-user',
                {
                    params: {
                        page: params.page,
                        size: params.size,
                        ...(params.sort && { sort: params.sort }),
                        ...(params.search && { search: params.search }),
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                return null;
            }
            throw error
        }
    },

    createUser: async (
        request: CreateNewUserRequest
    ): Promise<ApiResponse<CreatedUser> | null> => {
        try {
            const response = await apiClient.post<ApiResponse<CreatedUser>>('/admins/new-user', request);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                return null;
            }
            throw error
        }
    }
}