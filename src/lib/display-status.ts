import type { SubmissionStatus } from "@/types/submission.type";

export function displaySubmissionStatus(status: SubmissionStatus): string {
    switch (status) {
        case 'pending':
            return 'Dalam Proses';
        case 'verified_staff':
            return 'Terverifikasi Staff';
        case 'verified_adhoc':
            return 'Terverifikasi Adhoc';
        case 'rejected':
            return 'Ditolak';
        case 'rejected_staff':
            return 'Ditolak Staff';
        case 'rejected_adhoc':
            return 'Ditolak Adhoc';
        case 'completed':
            return 'Selesai';
        case 'in_process':
            return 'Dalam Proses';
        default:
            throw new Error(`Unhandled status: ${status}`);
    }
}

export function getStatusBadgeColor(status: SubmissionStatus): string {
    switch (status) {
        case 'pending':
            return 'bg-yellow-600/20';
        case 'verified_staff':
        case 'verified_adhoc':
            return 'bg-green-600/20';
        case 'rejected':
        case 'rejected_staff':
        case 'rejected_adhoc':
            return 'bg-red-600/20';
        case 'completed':
            return 'bg-gray-600/20';
        case 'in_process':
            return 'bg-blue-600/20';
        default:
            throw new Error(`Unhandled status: ${status}`);
    }
}