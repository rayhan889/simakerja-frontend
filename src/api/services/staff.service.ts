import type { ApiResponse } from "@/types/auth.types";
import type { Submission } from "@/types/submission.type";
import { AxiosError } from "axios";
import { apiClient } from "../client";
import type { StaffVerifySubmissionRequest } from "@/types/staff.type";

export const staffService = {

    updateSubmissionStatusToVerifiedByStaff: async (
        submissionId: string,
        request: StaffVerifySubmissionRequest
    ): Promise<ApiResponse<Submission> | null> => {
        try {
            const response = await apiClient.put<ApiResponse<Submission>>(
                `/staffs/verify-moa-ia/${submissionId}`,
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
    }
}