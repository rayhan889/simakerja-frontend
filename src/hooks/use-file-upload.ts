import { fileUploadService } from "@/api/services/file-upload.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";


export function useUploadPartnerLogo() {

    return useMutation({
        mutationFn: async (file: File) => {
            if (!file) {
                throw new Error("No file provided for upload");
            }

            const response = await fileUploadService.uploadPartnerLogo(file);

            if (response === null) {
                throw new Error("Sesi anda telah berakhir!. Silahkan login kembali.");
            }

            if (!response.success) {
                throw new Error("Gagal mengunggah logo. Silahkan coba lagi.");
            }

            return response.data;
        },

        onError: (error) => {
            toast.error("Gagal mengunggah logo : " + error.message)
            console.log("error uploading partner logo: " + error.message)
        }
    })
}

export function useGetPresignedUrlPartnerLogo() {
    return useMutation({

        mutationFn: async (objectKey: string) => {
            if (!objectKey) {
                throw new Error("No object key provided for getting presigned URL");
            }

            const response = await fileUploadService.getPresignedUrlPartnerLogo(objectKey);

            if (response === null) {
                throw new Error("Sesi anda telah berakhir!. Silahkan login kembali.");
            }

            if (!response.success) {
                throw new Error("Gagal mendapatkan URL. Silahkan coba lagi.");
            }

            return response.data;
        },

        onError: (error) => {
            toast.error("Gagal mendapatkan URL : " + error.message)
            console.log("error getting presigned URL for partner logo: " + error.message)
        }

    })
}

export function useUploadScannedDocument(submissionId: string) {
    return useMutation({
        mutationFn: async (file: File) => {
            if (!file) {
                throw new Error("No file provided for upload");
            }

            const response = await fileUploadService.uploadScannedDocument(file, submissionId);

            if (response === null) {
                throw new Error("Sesi anda telah berakhir!. Silahkan login kembali.");
            }

            if (!response.success) {
                throw new Error("Gagal mengunggah dokumen. Silahkan coba lagi.");
            }

            return response.data;
        },

        onError: (error) => {
            let message = error.message;

            if (error instanceof AxiosError && error.response?.data) {
                if (error.response.status === 400) {
                    message = "Dokumen yang diunggah tidak sesuai dengan format yang diminta. Silahkan coba lagi."
                }
            }

            toast.error("Gagal mengunggah dokumen : " + message)
            console.log("error uploading scanned document: " + error.message)
        }
    })
}