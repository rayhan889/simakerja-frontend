export type SubmissionType = 'moa_ia' | 'mou' | 'visit_request' | 'cooperation_request';

export type SubmissionStatus = 'pending' | 'in_process' | 'verified_adhoc' | 'verified_staff' |  'rejected' | 'completed';

export type MoAIASubmissionType = 'moa' | 'ia';

export type DocumentActivity = 'internship' | 'study_independent' | 'kkn' | 'research' | 'community_service';

export const activityLabels: Record<DocumentActivity, string> = {
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
    documentActivity: DocumentActivity;
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
    activityType: DocumentActivity;
    submissionDate: string;
    notes?: string;
}