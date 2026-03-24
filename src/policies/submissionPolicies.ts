import { isInCurrentHalfYear, formatCurrentPeriod } from "@/lib/submission-period";
import type { SubmissionsByUserIdAndMoAIAType } from "@/types/submission.type";

export function canCreateMoaIaSubmission(
    submissions: SubmissionsByUserIdAndMoAIAType[]
): { allowed: boolean; reason?: string } {

    const hasSubmissionInCurrentPeriod = submissions.some((submission) =>
        isInCurrentHalfYear(submission.period)
    );
    if (hasSubmissionInCurrentPeriod) {
        const periodName = formatCurrentPeriod();
        return {
            allowed: false,
            reason: `Anda sudah memiliki pengajuan pada periode ${periodName}. 
            Setiap mahasiswa hanya dapat melakukan satu kali pengajuan dalam satu semester (6 bulan). 
            Jika pengajuan Anda sebelumnya ditolak, silakan edit pengajuan tersebut melalui menu "Lacak Pengajuan MoA IA".`
        };
    }
    return { allowed: true };
}