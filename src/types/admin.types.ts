import type { UserRole } from "./user.type";

export interface CreateNewUserRequest {
    email: string;
    fullName: string;
    password: string;
    role: UserRole;
    nip?: string;
    nidn?: string;
    studyProgram?: string;
}