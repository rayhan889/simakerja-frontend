import type { ApiResponse } from "@/types/auth.types";
import { apiClient } from "@/api/client";
import { AxiosError } from "axios";
import type { CreateMoAIASubmissionRequest, MoAIASubmission, Submission, SubmissionDetails, SubmissionsByUserIdAndMoAIAType, UpdateMoaIaSubmissionRequest } from "@/types/submission.type";
import type { PaginationResponese } from "@/types/pagination.type";
import type { QueryParams, SearchParams } from "@/types/table.types";
import type { PartnerAndFacultyProfile } from '../../types/submission.type';

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

    getSubmissionsByUserIdAndMoAIAType: async (
      params: QueryParams,
      userId: string,
      nim?: string
    ): Promise<PaginationResponese<SubmissionsByUserIdAndMoAIAType> | null>  => {
      try {
        const response = await apiClient.get<ApiResponse<PaginationResponese<SubmissionsByUserIdAndMoAIAType>>>(
            `/submissions/moa-ia/${userId}`,
            {
                params: {
                    page: params.page,
                    size: params.size,
                    ...(params.sort && { sort: params.sort }),
                    ...(params.search && { search: params.search }),
                    ...(nim && { nim }),
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

    createSubmission: async (
      data: CreateMoAIASubmissionRequest
    ): Promise<ApiResponse<Submission> | null> => {
       try {
        const payload = {
          ...data,
          moaIa: {
            ...data.moaIa,
            studentSnapshots: data.moaIa.studentSnapshots.map((snapshot) => ({
              ...snapshot,
              total: snapshot.students.length,
            }))
          },
        }

         const response = await apiClient.post<ApiResponse<Submission>>(
              '/submissions',
              payload,
              {
                headers: {
                  'Content-Type': 'application/json',
                }
              }
          )
          return response.data
       } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
            return null;
          }
          throw error
       }
    },

    getAllExistingPartners: async (
      search?: SearchParams
    ):Promise<ApiResponse<PartnerAndFacultyProfile[]> | null> => {
      try {
        const response = await apiClient.get<ApiResponse<PartnerAndFacultyProfile[]>>(
          '/submissions/partners',
          {
            params: {
              ...(search?.search && { search: search.search }),
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

    updateSubmission: async (
      submissionId: string,
      data: UpdateMoaIaSubmissionRequest

    ): Promise<ApiResponse<Submission> | null> => {
      try {
        const payload = {
          ...data,
          moaIa: {
            ...data.moaIa,
            studentSnapshots: data.moaIa.studentSnapshots.map((snapshot) => ({
              ...snapshot,
              total: snapshot.students.length,
            }))
          },
        }

        const response = await apiClient.put<ApiResponse<Submission>>(
          `/submissions/${submissionId}`,
          payload,
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

    getSubmissionDetails: async (
      submissionId: string
    ): Promise<ApiResponse<SubmissionDetails> | null> => {
      try {
        const response = await apiClient.get<ApiResponse<SubmissionDetails>>(
            `/submissions/details/${submissionId}`,
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