export type UserRole = 'student' | 'lecturer' | 'staff' | 'adhoc';

export type UserStatus = 'active' | 'inactive';

export interface User {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: UserRole;
    createdAt: string;
    status: UserStatus;
}

export interface Student {
    id: string;
    userId: string;
    nim: string;
    studyProgram: string;
}

export interface Staff {
    id: string;
    userId: string;
    fullName: string;
    nip: string;
}

export interface UpdateStudentRequest {
    nim: string;
    studyProgram: string;
}