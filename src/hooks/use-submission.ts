import { submissionService } from "@/api/services/submissio.service";
import type { CreateMoAIASubmissionRequest } from "@/types/submission.type";
import type { QueryParams, SearchParams } from "@/types/table.types";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner"

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

export function useSubmissionsByUserIdAndMoAIAType(params: QueryParams, userId: string) {
    return useQuery({
        queryKey: submissionKeys.moaIaByUserList(params, userId),

        queryFn: () => submissionService.getSubmissionsByUserIdAndMoAIAType(params, userId),

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

export function usePartners(search?: SearchParams) {
    return useQuery({
        queryKey: submissionKeys.partnerList(search),

        queryFn: () => submissionService.getAllExistingPartners(search),

        placeholderData: keepPreviousData,

        staleTime: 10 * 60 * 1000,

        refetchOnWindowFocus: false,
    })
}

export type SubmissionResult = ReturnType<typeof useSubmissions>;
export type MoAIASubmissionResult = ReturnType<typeof useMoaIASubmissions>;
export type SubmissionsByUserIdAndMoAIATypeResult = ReturnType<typeof useSubmissionsByUserIdAndMoAIAType>;