import type { UserRole } from "@/types/user.type";

export const displayRole = (role: UserRole) => {
    switch (role) {
    case 'student':
        return 'Mahasiswa';
    case 'staff':
        return 'Staf';
    case 'superadmin':
        return 'Superadmin';
    case 'lecturer':
        return 'Dosen';
    default:
        return role;
    }
}