import { generateFileService } from "@/api/services/generate-file.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from 'react';

export const generateFileKeys = {
    all: ["generateFile"] as const,
    bySubmissionId: (submissionId: string) => [...generateFileKeys.all, submissionId] as const,
} 

export function useGenerateFile(submissionId: string | null) {
    const query = useQuery({
        queryKey: generateFileKeys.bySubmissionId(submissionId!),

        queryFn: () => generateFileService.generateMoAIAPDF(submissionId!),

        retry: 0,

        refetchOnWindowFocus: false,

        staleTime:5 * 60 * 1000, // 5 minutes

        enabled: !!submissionId,
    })

    const pdfBlobUrl = useMemo(() => {
        if (!query.data) return null;
        return URL.createObjectURL(query.data);
    }, [query.data])

    return {
        ...query,
        pdfBlobUrl,
    }
}