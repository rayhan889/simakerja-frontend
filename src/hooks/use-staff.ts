import { staffService } from "@/api/services/staff.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionKeys } from "./use-submission";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useVerifySubmissionByStaff() {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (submissionId: string) => {

            const response = await staffService.updateSubmissionStatusToVerifiedByStaff(
                submissionId,
            );

            if (response === null) {
                throw new Error("Sesi anda telah berakhir!. Silahkan login kembali.");
            }

            if (!response.success) {
                throw new Error(response.message || "Gagal memverifikasi pengajuan.");
            }

            return response;
        },

        onSuccess: async (_data, submissionId) => {
            await queryClient.invalidateQueries({
                queryKey: submissionKeys.all,
            });

            await queryClient.invalidateQueries({
                queryKey: submissionKeys.details(submissionId),
            });

            toast.success("Pengajuan berhasil diverifikasi.");
        },

        onError: (error) => {
            let message = error.message;

            if (error instanceof AxiosError && error.response?.data) {
                message = error.response.data.message || message;
            }

            toast.error("Gagal memverifikasi pengajuan: " + message);
            console.log("failed to verifying submission: " + message);
        },
    })
}