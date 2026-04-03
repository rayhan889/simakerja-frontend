import type { AuthUser } from "@/types/auth.types";

export function canCreateSubmission(user: AuthUser | null): {
  allowed: boolean
  reason?: string
} {
    if (user?.role !== 'student') {
        return {
            allowed: false,
            reason: "Hanya mahasiswa yang dapat membuat pengajuan"
        }
    }
    
    if (!user.nim || !user.studyProgram || !user.phoneNumber) {
        return {
            allowed: false,
            reason: "NIM, program studi, dan nomor telepon harus terisi untuk membuat pengajuan"
        }
    }

    return {allowed: true}
}