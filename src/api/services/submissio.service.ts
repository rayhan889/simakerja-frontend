import type { ApiResponse } from "@/types/auth.types";
import { apiClient } from "@/api/client";
import { AxiosError } from "axios";
import type { MoAIASubmission, Submission } from "@/types/submission.type";
import type { PaginationResponese } from "@/types/pagination.type";
import type { QueryParams } from "@/types/table.types";

export const submissionService = {

    getPaginatedSubmissions: async (
        params: QueryParams
    ): Promise<PaginationResponese<Submission> | null> => {
        try {
          const response = await apiClient.get<ApiResponse<PaginationResponese<Submission>>>(
            `/submissions`,
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

    getPaginatedMoASubmissionsByUserId: async (
        params: QueryParams
    ): Promise<PaginationResponese<MoAIASubmission> | null> => {
      try {
        const response = await apiClient.get<ApiResponse<PaginationResponese<MoAIASubmission>>>(
            '/submissions/moa-ia',
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
}