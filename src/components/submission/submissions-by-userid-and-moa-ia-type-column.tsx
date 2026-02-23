import type { ActivityType, MoAIASubmissionType, SubmissionsByUserIdAndMoAIAType, SubmissionStatus } from "@/types/submission.type";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { Pencil, FileText } from "lucide-react";
import { displayFullName } from "@/lib/display-fullname";


const submissionByUserIdAndMoATypeColumnHelper = createColumnHelper<SubmissionsByUserIdAndMoAIAType>();

export interface SubmissionColumnOptions {
    onViewPdf?: (submissionId: string, partnerName: string) => void;
    onViewDetail?: (submission: SubmissionsByUserIdAndMoAIAType) => void;
    onEdit?: (submission: SubmissionsByUserIdAndMoAIAType) => void;
    canEdit?: (submission: SubmissionsByUserIdAndMoAIAType) => void;
    isEditable?: boolean;
}

export function getSubmissionByUserIdAndMoATypeColumns(
    options: SubmissionColumnOptions = {}
): ColumnDef<SubmissionsByUserIdAndMoAIAType, never>[] {
    return [
        submissionByUserIdAndMoATypeColumnHelper.accessor('applicantName', {
            header: 'Nama Pengaju',
            cell: (info) => {
                const applicantName = displayFullName(info.getValue() as string);
                const applicantNim = info.row.original.applicantNim;

                return (
                    <div className="max-w-50">
                        <p 
                            className="font-medium text-gray-900 truncate" 
                            title={applicantName}
                        >
                            {applicantName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {applicantNim}
                        </p>
                    </div>
                );
            },
            enableSorting: false, 
        }),

        submissionByUserIdAndMoATypeColumnHelper.accessor('partnerName', {
            header: 'Nama Mitra',
            cell: (info) => {
                const partnerName = info.getValue() as string;
                const partnerNumber = info.row.original.partnerNumber;

                return (
                    <div className="max-w-50">
                        <p 
                            className="font-medium text-gray-900 truncate" 
                            title={partnerName}
                        >
                            {partnerName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {partnerNumber}
                        </p>
                    </div>
                );
            },
            enableSorting: false, 
        }),

        submissionByUserIdAndMoATypeColumnHelper.accessor('activityType', {
            header: 'Bentuk Kerjasama',
            cell: (info) => {
                const activity = info.getValue() as ActivityType;
                return (
                    <span className="text-gray-600">
                        {
                            activity == 'internship' ? 'Magang' :
                            activity == 'study_independent' ? 'Studi Independen' :
                            activity == 'kkn' ? 'KKN' :
                            activity == 'research' ? 'Penelitian' :
                            activity == 'community_service' ? 'Pengabdian Masyarakat' :
                            activity
                        }
                    </span>
                );
            },
            enableSorting: false
        }),

        submissionByUserIdAndMoATypeColumnHelper.accessor('documentType', {
            header: 'Tipe Dokumen',
            cell: (info) => {
                const documentType = info.getValue() as MoAIASubmissionType;
                return (
                    <span className="text-gray-600">
                        {
                            documentType == 'moa' ? 'MoA' :
                            documentType == 'ia' ? 'IA' :
                            documentType
                        }
                    </span>
                );
            },
            enableSorting: false
        }),

        submissionByUserIdAndMoATypeColumnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => {
                const status = info.getValue() as SubmissionStatus;
                return (
                    <Badge 
                        variant={'secondary'}
                        className={`
                            ${status == 'pending' ? 'bg-yellow-600/20' : 
                            status == 'in_process' ? 'bg-blue-600/20' : 
                            status == 'verified_adhoc' ? 'bg-green-600/20' : 
                            status == 'verified_staff' ? 'bg-green-600/20' : 
                            status == 'rejected' ? 'bg-red-600/20' : 
                            status == 'completed' ? 'bg-gray-600/20' : 'transparent'}
                        `}
                    >
                        {
                            status == 'pending' ? 'Pending' :
                            status == 'in_process' ? 'Dalam Proses' :
                            status == 'verified_adhoc' ? 'Terverifikasi Adhoc' :
                            status == 'verified_staff' ? 'Terverifikasi Staff' :
                            status == 'rejected' ? 'Ditolak' :
                            status == 'completed' ? 'Selesai' : status
                        }
                    </Badge>
                );
            },
            enableSorting: false
        }),

        submissionByUserIdAndMoATypeColumnHelper.accessor('submissionDate', {
            header: 'Tanggal Pengajuan',
            cell: (info) => {
                const date = new Date(info.getValue() as string);
                return (
                    <span className="text-gray-600">
                        {date.toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                );
            },
            enableSorting: true,
        }),

        submissionByUserIdAndMoATypeColumnHelper.accessor('notes', {
            header: 'Catatan',
            cell: (info) => {
                const notes = info.getValue() as string | undefined;
                return (
                    <span className="text-gray-600">
                        {notes ? notes : '-'}
                    </span>
                );
            },
            enableSorting: false,
        }),

        submissionByUserIdAndMoATypeColumnHelper.display({
            id: 'actions', 
            header: '',    
            cell: (info) => {
                const submission = info.row.original;
                const { submissionId, partnerName } = info.row.original;

                const canEdit = options.canEdit
                ? options.canEdit(submission)
                : !!options.isEditable;

                return (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => options.onViewPdf!(submissionId, partnerName)}
                            className="rounded-full p-2 cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            title="Lihat Dokumen"
                        >
                            <FileText className="h-4 w-4" />
                        </button>

                        <button
                            onClick={() => canEdit && options.onEdit?.(submission)}
                            disabled={!canEdit}
                            className={`rounded-full p-2 transition-colors ${
                                canEdit
                                ? "cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                : "cursor-not-allowed text-gray-300 opacity-50"
                            }`}
                            title={
                                canEdit
                                ? "Edit Dokumen"
                                : "Tidak dapat diedit (status bukan pending/dalam proses atau bukan pemilik)"
                            }
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                );
            },
            enableSorting: false,  
        }),
    ];
}

export const submissionByUserIdAndMoATypeColumns = getSubmissionByUserIdAndMoATypeColumns();