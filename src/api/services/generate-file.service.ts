import { AxiosError } from "axios";
import { apiClient } from "../client";

export const generateFileService = {

    generateMoAIAPDF: async (
        submissionId: string
    ): Promise<Blob | null> => {
        try {
            const response = await apiClient.get(`generate-file/moa-ia/${submissionId}`, {
                responseType: 'blob',
            });
            return response.data;     
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
            return null;
            }
            throw error
        }
    }
}