import { fileUploadService } from "@/api/services/file-upload.service";
import { useMutation } from "@tanstack/react-query";
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