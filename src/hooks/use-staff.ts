import { staffService } from "@/api/services/staff.service";
import type { StaffVerifySubmissionRequest } from "@/types/staff.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionKeys } from "./use-submission";
import { toast } from "sonner";
import { AxiosError } from "axios";

type StaffVerifySubmissionVariables = {
  submissionId: string;
} & StaffVerifySubmissionRequest;

export function useVerifySubmissionByStaff() {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (variables: StaffVerifySubmissionVariables) => {
            const { submissionId, submissionStatus } = variables;

            const response = await staffService.updateSubmissionStatusToVerifiedByStaff(
                submissionId,
                { submissionStatus },
            );

            if (response === null) {
                throw new Error("Sesi anda telah berakhir!. Silahkan login kembali.");
            }

            if (!response.success) {
                throw new Error(response.message || "Gagal memverifikasi pengajuan.");
            }

            return response;
        },

        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: submissionKeys.all,
            });

            await queryClient.invalidateQueries({
                queryKey: submissionKeys.details(variables.submissionId),
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