import type { SubmissionStatus } from '@/types/submission.type';

export type ProcessRole = 'staff' | 'lecturer';

export interface ProcessSubmissionRoleConfig {
  selectableStatuses: SubmissionStatus[];
  defaultStatus: SubmissionStatus;
}

export const roleConfigMap: Record<ProcessRole, ProcessSubmissionRoleConfig> = {
  staff: {
    selectableStatuses: ['verified_staff', 'rejected_staff'],
    defaultStatus: 'verified_staff',
  },
  lecturer: {
    selectableStatuses: ['verified_adhoc', 'rejected_adhoc', 'completed'],
    defaultStatus: 'verified_adhoc',
  },
};

export const allVisibleStatuses: SubmissionStatus[] = [
  'verified_staff',
  'verified_adhoc',
  'rejected_staff',
  'rejected_adhoc',
  'completed',
  'in_process'
];
