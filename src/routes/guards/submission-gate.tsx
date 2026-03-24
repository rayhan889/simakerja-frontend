import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubmissionsByUserIdAndMoAIAType } from "@/hooks/use-submission";
import { canCreateMoaIaSubmission } from "@/policies/submissionPolicies";
import { Loader2 } from "lucide-react";

interface SubmissionGateProps {
    children: ReactNode;
    fallback?: (reason: string) => ReactNode;
}

export const SubmissionGate = ({
    children,
    fallback
}: SubmissionGateProps) => {
    const { user } = useAuth();
    const userId = user?.id || "";
    const isStudent = user?.role === 'student';

    const {
        data,
        isLoading,
        isError
    } = useSubmissionsByUserIdAndMoAIAType(
        { page: 0, size: 50 },
        userId,
        isStudent ? user?.nim : undefined
    );

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (isError) {
        if (fallback) {
            return <>{fallback("Gagal memuat riwayat pengajuan. Silakan coba memuat ulang halaman.")}</>;
        }
        return null;
    }

    const submissions = data?.content ?? [];
    const result = canCreateMoaIaSubmission(submissions);

    if (!result.allowed) {
        if (fallback && result.reason) {
            return <>{fallback(result.reason)}</>;
        }
        return null;
    }

    return <>{children}</>;
};
