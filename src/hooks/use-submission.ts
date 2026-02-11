import { submissionService } from "@/api/services/submissio.service";
import type { QueryParams } from "@/types/table.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const submissionKeys = {
    all: ["submissions"] as const,
    lists: () => [...submissionKeys.all, "list"] as const,
    list: (params: QueryParams) => [...submissionKeys.lists(), { params }] as const,
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

export const moaIASubmissionKeys = {
    all: ["moa-ia-submissions"] as const,
    lists: () => [...moaIASubmissionKeys.all, "list"] as const,
    list: (params: QueryParams) => [...moaIASubmissionKeys.lists(), { params }] as const,
}

export function useMoaIASubmissions(params: QueryParams) {
     return useQuery({
        queryKey: moaIASubmissionKeys.list(params),

        queryFn: () => submissionService.getPaginatedMoASubmissionsByUserId(params),

        placeholderData: keepPreviousData,

        staleTime: 10 * 60 * 1000, // 10 minutes

        refetchOnWindowFocus: false,

        retry: 1,
    })
}

export type SubmissionResult = ReturnType<typeof useSubmissions>;
export type MoAIASubmissionResult = ReturnType<typeof useMoaIASubmissions>;