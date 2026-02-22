import type { ApiResponse } from "@/types/auth.types";
import type { Student, StudentInfo, UpdateStudentRequest } from "@/types/user.type";
import { AxiosError } from "axios";
import { apiClient } from "../client";

export const userService = {

    updateStudent: async (
        userId: string,
        request: UpdateStudentRequest
    ): Promise<ApiResponse<Student> | null> => {
        try {
            const response = await apiClient.put<ApiResponse<Student>>(
                `/students/${userId}`,
                request,
                    {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                return null;
            }
            throw error
        }
    },

    getAllRegisteredStudents: async (
        excludeNim?: string
    ): Promise<ApiResponse<StudentInfo[]> | null> => {
        try {
            const response = await apiClient.get<ApiResponse<StudentInfo[]>>(
                '/students/registered',
                {
                    params: {
                        exclude_nim: excludeNim,
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                return null;
            }
            throw error
        }
    }
}