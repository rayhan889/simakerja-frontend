import { submissionService } from "@/api/services/submission.service";
import type { CreateMoAIASubmissionRequest, UpdateMoaIaSubmissionRequest } from "@/types/submission.type";
import type { QueryParams, SearchParams } from "@/types/table.types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner"
import { generateFileKeys } from "./use-generate-file";

export const submissionKeys = {
    all: ["submissions"] as const,
    lists: () => [...submissionKeys.all, "list"] as const,
    list: (params: QueryParams) => [...submissionKeys.lists(), { params }] as const,
    moaIa: () => [...submissionKeys.all, 'moa-ia'] as const,
    moaIaList: (params: QueryParams) => [...submissionKeys.moaIa(), 'list', params] as const,
    moaIaByUser: (userId: string) => [...submissionKeys.moaIa(), 'user', userId] as const,
    moaIaByUserList: (params: QueryParams, userId: string) => 
        [...submissionKeys.moaIaByUser(userId), 'list', params] as const,
    partnerList: (search?: SearchParams) => [...submissionKeys.all, 'partners', search] as const,
    details: (submissionId: string) => [...submissionKeys.all, 'details', submissionId] as const,
    moaIaForStaffList: (params: QueryParams) => [...submissionKeys.all, 'moa-ia-staff', 'list', params] as const,
    moaIaForStaffDetailList: (params: QueryParams, partnerName?: string, period?: string, activityType?: string) => [...submissionKeys.all, 'moa-ia-staff', 'detail-list', params, { partnerName, period, activityType }] as const,
}

export function useSubmissions(params: QueryParams) {
    return useQuery({
        queryKey: submissionKeys.list(params),

        queryFn: () => submissionService.getPaginatedSubmissions(params),

        placeholderData: keepPreviousData,

        staleTime: 2 * 60 * 1000, // 5 minutes

        refetchOnWindowFocus: false,

        retry: 1,
    })
}

export function useMoaIASubmissions(params: QueryParams) {
     return useQuery({
        queryKey: submissionKeys.moaIaList(params),

        queryFn: () => submissionService.getPaginatedMoASubmissionsByUserId(params),

        placeholderData: keepPreviousData,

        staleTime: 10 * 60 * 1000, // 10 minutes

        refetchOnWindowFocus: false,

        retry: 1,
    })
}

export function useSubmissionsByUserIdAndMoAIAType(params: QueryParams, userId: string, nim?: string) {
    return useQuery({
        queryKey: submissionKeys.moaIaByUserList(params, userId),

        queryFn: () => submissionService.getSubmissionsByUserIdAndMoAIAType(params, userId, nim),

        placeholderData: keepPreviousData,

        staleTime: 10 * 60 * 1000, // 10 minutes

        refetchOnWindowFocus: false,

        retry: 1,

        enabled: !!userId,
    })
}

export function useCreateSubmission() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: CreateMoAIASubmissionRequest) => {
            const response = await submissionService.createSubmission(data);

            if (response === null) {
                throw new Error("Sesi anda telah berakhir!. Silahkan login kembali.");
            }

            if (!response.success) {
                throw new Error(response.message || "Gagal membuat pengajuan.");
            }

            return response;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: submissionKeys.all
            })
            navigate('/dashboard/track-submission')
            toast.success("Pengajuan berhasil dibuat.")
        },

        onError: (error) => {
            let message = error.message;
  
            if (error instanceof AxiosError && error.response?.data) {
                console.log("error response status: " + error.response.status)
                if (error.response.status === 409) {
                    message = "Nama mitra sudah pernah digunakan untuk jenis MoAIA yang sama. Silakan gunakan nama mitra yang berbeda.";
                }
            }
            
            toast.error("Gagal membuat pengajuan: " + message);
            console.log("failed to create submission: " + message);
        }
    })
}

export function useSubmissionDetails(submissionId: string) {
    return useQuery({
        queryKey: submissionKeys.details(submissionId),

        queryFn: () => submissionService.getSubmissionDetails(submissionId),

        staleTime: 5 * 60 * 1000, // 5 minutes

        refetchOnWindowFocus: false,

        retry: 1,

        enabled: !!submissionId,
    })
}

export function useUpdateSubmission(submissionId: string) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: UpdateMoaIaSubmissionRequest) =>{
            const response = await submissionService.updateSubmission(submissionId, data);

            if (response === null) {
                throw new Error("Sesi anda telah berakhir!. Silahkan login kembali.");
            }

            if (!response.success) {
                throw new Error(response.message || "Gagal memperbarui pengajuan.");
            }

            return response;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: submissionKeys.all
            });

            queryClient.invalidateQueries({
                queryKey: generateFileKeys.all
            })
            navigate('/dashboard/track-submission')
            toast.success("Pengajuan berhasil diperbarui.")
        },

        onError: (error) => {
            let message = error.message;
  
            if (error instanceof AxiosError && error.response?.data) {
                console.log("error response status: " + error.response.status)
                if (error.response.status === 409) {
                    message = "Nama mitra sudah pernah digunakan untuk jenis MoAIA yang sama. Silakan gunakan nama mitra yang berbeda.";
                }
            }
            
            toast.error("Gagal memperbarui pengajuan: " + message);
            console.log("failed to update submission: " + message);
        }
    })
}

export function usePartners(search?: SearchParams) {
    return useQuery({
        queryKey: submissionKeys.partnerList(search),

        queryFn: () => submissionService.getAllExistingPartners(search),

        placeholderData: keepPreviousData,

        staleTime: 10 * 60 * 1000,

        refetchOnWindowFocus: false,
    })
}

export function useMoaIASubmissionsForStaff(params: QueryParams) {
    return useQuery({
        queryKey: submissionKeys.moaIaForStaffList(params),

        queryFn: () => submissionService.getStaffSubmissionsPagination(params),

        placeholderData: keepPreviousData,

        staleTime: 10 * 60 * 1000, // 10 minutes

        refetchOnWindowFocus: false,

        retry: 1,
    })
}

export function useMoaIASubmissionsDetailForStaff(params: QueryParams, partnerName: string, period: string, activityType: string) {
    const hasFilters = !!(partnerName && period && activityType)

    return useQuery({
        queryKey: submissionKeys.moaIaForStaffDetailList(params, partnerName, period, activityType),
        
        queryFn: () => submissionService.getStaffSubmissionsPaginationDetail(params, partnerName, period, activityType),

        placeholderData: keepPreviousData,

        staleTime: 10 * 60 * 1000, // 10 minutes

        refetchOnWindowFocus: false,

        retry: 1,

        enabled: hasFilters,
    })
}

export type SubmissionResult = ReturnType<typeof useSubmissions>;
export type MoAIASubmissionResult = ReturnType<typeof useMoaIASubmissions>;
export type SubmissionsByUserIdAndMoAIATypeResult = ReturnType<typeof useSubmissionsByUserIdAndMoAIAType>;
export type SubmissionDetailsResult = ReturnType<typeof useSubmissionDetails>;
export type MoAIASubmissionsForStaffResult = ReturnType<typeof useMoaIASubmissionsForStaff>;
export type MoAIASubmissionsDetailForStaffResult = ReturnType<typeof useMoaIASubmissionsDetailForStaff>;