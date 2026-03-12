import type { ApiResponse } from "@/types/auth.types";
import type { Submission, UpdateSubmissionFromAdhocOrStaffRequest } from "@/types/submission.type";
import { AxiosError } from "axios";
import { apiClient } from "../client";


export const lecturerService = {

    processSubmissionByLecturer: async (
        submissionId: string,
        request: UpdateSubmissionFromAdhocOrStaffRequest
    ): Promise<ApiResponse<Submission> | null> => {
        try {
            const response = await apiClient.put<ApiResponse<Submission>>(
                `/adhocs/process-moa-ia/${submissionId}`,
                request
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