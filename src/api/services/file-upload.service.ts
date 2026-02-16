import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/types/auth.types";
import type { FileUploadResponse } from "@/types/file-upload.type";
import { AxiosError } from "axios";

export const fileUploadService = {

    uploadPartnerLogo: async (
        file: File
    ): Promise<ApiResponse<FileUploadResponse> | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
                '/uploads/partner-logo',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
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