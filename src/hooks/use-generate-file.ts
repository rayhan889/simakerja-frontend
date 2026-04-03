import { generateFileService } from "@/api/services/generate-file.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from 'react';

export const generateFileKeys = {
    all: ["generateFile"] as const,
    bySubmissionId: (submissionId: string) => [...generateFileKeys.all, submissionId] as const,
}

export function useGenerateFile(submissionId: string | null) {
    const query = useQuery({
        queryKey: generateFileKeys.bySubmissionId(submissionId!),

        queryFn: () => generateFileService.generateMoAIAPDF(submissionId!),

        retry: 2,

        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

        refetchOnWindowFocus: false,

        staleTime: 15 * 60 * 1000,

        gcTime: 20 * 60 * 1000,

        enabled: !!submissionId,
    })

    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const previousUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (!query.data) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPdfBlobUrl(null)
            return;
        }

        if (previousUrlRef.current) {
            URL.revokeObjectURL(previousUrlRef.current);
        }
        const url = URL.createObjectURL(query.data);
        previousUrlRef.current = url;
        setPdfBlobUrl(url);

        return () => {
            URL.revokeObjectURL(url);
            previousUrlRef.current = null;
        };
        
    }, [query.data, query.dataUpdatedAt]);

    return {
        ...query,
        pdfBlobUrl,
    }
}