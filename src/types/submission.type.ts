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
    partnerName: string;
    partnerNumber: string;
    status: SubmissionStatus;
    activityType: ActivityType;
    submissionDate: string;
    notes?: string;
}

export interface StudentSnapshotRequest {
    studyProgram: string;
    students: Array<string>;
    unit: string;
}

export interface MoAIADetailRequest {
    documentType: MoAIASubmissionType;
    partnerName: string;
    partnerNumber: string;
    facultyRepresentativeName: string;
    partnerRepresentativeName: string;
    partnerRepresentativePosition: string;
    activityType: ActivityType;
    studentSnapshots: Array<StudentSnapshotRequest>;
}

export interface CreateMoAIASubmissionRequest {
    submissionType: SubmissionType;
    notes?: string;
    faculty: string;
    moaIa: MoAIADetailRequest;
}

export const studyProgramOptions = [
  { value: 'teknik_informatika', label: 'Teknik Informatika' },
  { value: 'sistem_informasi', label: 'Sistem Informasi' },
  { value: 'pendidikan_teknologi_informasi', label: 'Pendidikan Teknologi Informasi' },
] as const;

export type StudyProgram = typeof studyProgramOptions[number]['value'];