import type { StudentInfo, User } from "./user.type";

export type SubmissionType = 'moa_ia' | 'mou' | 'visit_request' | 'cooperation_request';

export type SubmissionStatus = 'pending' | 'in_process' | 'verified_adhoc' | 'verified_staff' |  'rejected' | 'completed';

export type MoAIASubmissionType = 'moa' | 'ia';

export type ActivityType = 'internship' | 'study_independent' | 'kkn' | 'research' | 'community_service';

export const activityLabels: Record<ActivityType, string> = {
  internship: 'Magang',
  study_independent: 'Studi Independen',
  kkn: 'KKN',
  research: 'Penelitian',
  community_service: 'Pengabdian Masyarakat',
};

export const documentTypeLabels: Record<string, string> = {
  moa: 'MoA',
  ia: 'IA',
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
}

export interface StudentSnapshotRequest {
    studyProgram: string;
    students: Array<StudentInfo>;
    unit: string;
}

export interface MoaIaDetails {
    partnerName: string;
    partnerNumber: string;
    facultyRepresentativeName: string;
    partnerRepresentativeName: string;
    partnerRepresentativePosition: string;
    activityType: ActivityType;
    documentType: MoAIASubmissionType;
    studentSnapshots: Array<StudentSnapshotRequest>;
    partnerAddress: string;
    partnerLogoKey: string;
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
    partnerNumber: string;
    partnerAddress: string;
    facultyRepresentativeName: string;
    partnerRepresentativeName: string;
    partnerRepresentativePosition: string;
    activityType: ActivityType;
    studentSnapshots: Array<StudentSnapshotRequest>;
    partnerLogoKey: string;
}

export interface SubmissionDetails {
    id: string;
    user: User;
    submissionCode: string;
    submissionStatus: SubmissionStatus;
    notes: string;
    faculty: string;
    submissionDate: string;

    facultyLetterNumber?: string;
    facultyAddress: string;
    createdAt: string;
    updatedAt: string;

    moaIa?: MoaIaDetails | null;
}

export interface CooperationRequestDetails {
    partnerName: string;
}

export const studyProgramOptions = [
  { value: 'teknik_informatika', label: 'Teknik Informatika' },
  { value: 'sistem_informasi', label: 'Sistem Informasi' },
  { value: 'pendidikan_teknologi_informasi', label: 'Pendidikan Teknologi Informasi' },
];

export type StudyProgram = typeof studyProgramOptions[number]['value'];