import type { StudentInfo, User } from "./user.type";

export type SubmissionType = 'moa_ia' | 'mou' | 'visit_request' | 'cooperation_request';

export type SubmissionStatus = 'pending' | 'in_process' | 'verified_adhoc' | 'verified_staff' | 'rejected' | 'completed' | 'rejected_adhoc' | 'rejected_staff';

export type MoAIASubmissionType = 'moa' | 'ia' | 'moa_ia';

export type ActivityType = 'internship' | 'study_independent' | 'kkn';

export type MoaIASubmissionMode = 'new_partner' | 'existing_partner';

export const activityLabels: Record<ActivityType, string> = {
    internship: 'Magang',
    study_independent: 'Studi Independen',
    kkn: 'KKN'
};

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
    pending: 'Menunggu Verifikasi',
    in_process: 'Sedang Diproses',
    verified_adhoc: 'Terverifikasi Adhoc',
    verified_staff: 'Terverifikasi Staff',
    rejected: 'Ditolak',
    completed: 'Selesai',
    rejected_adhoc: 'Ditolak Adhoc',
    rejected_staff: 'Ditolak Staff'
};

export const documentTypeLabels: Record<string, string> = {
    moa: 'MoA',
    ia: 'IA',
    moa_ia: 'MoA & IA Terintegrasi'
};

export interface Submission {
    id: string;
    submissionCode?: string; // later on should be required
    userId: string;
    submissionType: SubmissionType;
    status: SubmissionStatus;
    notes?: string;
    facultyLetterNumber?: string;
    faculty: string;
    submissionDate: string; // ISO date string
}

export interface MoAIASubmission {
    partnerName: string;
    partnerNumber: string;
    facultyRepresentativeName: string;
    partnerRepresentativeName: string;
    partnerRepresentativePosition: string;
    studentSnapshot: StudentSnapshot;
    activityType: ActivityType;
    documentType: MoAIASubmissionType;
}

export interface StudentSnapshot {
    studyProgram: string;
    students: Array<string>;
    unit: string;
    total: number;
}

export interface SubmissionsByUserIdAndMoAIAType {
    applicantId: string;
    applicantName: string;
    applicantNim: string;
    submissionId: string;
    partnerName: string;
    partnerNumber: string;
    status: SubmissionStatus;
    activityType: ActivityType;
    submissionDate: string;
    notes?: string;
    documentType: MoAIASubmissionType;
    period: string;
}

export interface StudentSnapshotRequest {
    studyProgram: string;
    students: Array<StudentInfo>;
    unit: string;
}

export interface MoaIaDetails {
    partnerName: string;
    partnerNumber?: string;
    facultyRepresentativeName: string;
    partnerRepresentativeName: string;
    partnerRepresentativePosition: string;
    activityType: ActivityType;
    documentType: MoAIASubmissionType;
    studentSnapshots: Array<StudentSnapshotRequest>;
    partnerAddress: string;
    partnerLogoKey: string;
    partnerCooperationPeriod: number;
    scannedDocumentKey?: string;
    averageConfidence?: number;
    mode: MoaIASubmissionMode;
}

export interface CreateMoAIASubmissionRequest {
    submissionType: SubmissionType;
    notes?: string;
    faculty: string;
    facultyAddress: string;
    moaIa: MoaIaDetails;
}

export interface PartnerAndFacultyProfile {
    partnerName: string
    partnerAddress: string
    partnerNumber: string
    partnerRepresentativeName: string
    partnerRepresentativePosition: string
    activityType: ActivityType
    partnerLogoKey: string
    facultyRepresentativeName: string
}

export interface UpdateMoaIaSubmissionRequest {
    notes?: string;
    moaIa: MoaIaUpdateDetailRequest;
}

export interface MoaIaUpdateDetailRequest {
    partnerName: string;
    partnerNumber?: string;
    partnerAddress: string;
    facultyRepresentativeName: string;
    partnerRepresentativeName: string;
    partnerRepresentativePosition: string;
    activityType: ActivityType;
    studentSnapshots: Array<StudentSnapshotRequest>;
    partnerLogoKey: string;
    partnerCooperationPeriod: number;
    scannedDocumentKey?: string | null;
    averageConfidence?: number | null;
}

export interface SubmissionDetails {
    id: string;
    user: User;
    submissionCode: string;
    status: SubmissionStatus;
    notes: string;
    faculty: string;
    submissionDate: string;

    facultyLetterNumber?: string;
    facultyAddress: string;
    createdAt: string;
    updatedAt: string;

    lecturerVerifiedAt?: string;
    staffVerifiedAt?: string;

    moaIa?: MoaIaDetails | null;
}

export interface CooperationRequestDetails {
    partnerName: string;
}

export interface StaffSubmissionPagination {
    period: string;
    partnerName: string;
    partnerNumber: string;
    activityType: ActivityType;
    totalSubmissions: number;
}

export interface StaffSubmissionPaginationDetail {
    submissionId: string;
    submissionCode: string;
    applicantStudyProgram: string;
    applicantFullname: string;
    applicantNim: string;
    submissionStatus: SubmissionStatus;
}

export interface UpdateSubmissionFromAdhocOrStaffRequest {
    submissionStatus: SubmissionStatus;
    notes?: string;
}

export interface LecturerSubmissionPagination {
    period: string;
    partnerName: string;
    partnerNumber: string;
    activityType: ActivityType;
    totalSubmissions: number;
}

export interface LecturerSubmissionPaginationDetail {
    submissionId: string;
    submissionCode: string;
    applicantFullname: string;
    applicantNim: string;
    submissionStatus: SubmissionStatus;
}

export const studyProgramOptions = [
    { value: 'teknik_informatika', label: 'Teknik Informatika' },
    { value: 'sistem_informasi', label: 'Sistem Informasi' },
    { value: 'pendidikan_teknologi_informasi', label: 'Pendidikan Teknologi Informasi' },
];

export const partnerCooperationPeriodOptions = [
    { value: 1, label: '1 Tahun' },
    { value: 3, label: '3 Tahun' },
    { value: 5, label: '5 Tahun' },
    { value: 7, label: '7 Tahun' },
];

export type StudyProgram = typeof studyProgramOptions[number]['value'];
export type PartnerCooperationPeriod = typeof partnerCooperationPeriodOptions[number]['value'];