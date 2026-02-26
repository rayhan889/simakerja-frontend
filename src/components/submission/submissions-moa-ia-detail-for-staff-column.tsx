import { displayFullName } from "@/lib/display-fullname";
import { studyProgramOptions, type StaffSubmissionPaginationDetail } from "@/types/submission.type";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Check, FileText, Loader2, PencilIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import type { StaffVerifySubmissionRequest } from "@/types/staff.type";
import type { SubmissionStatus } from '../../types/submission.type';

const submissionsMoaIaDetailForStaffColumnHelper = createColumnHelper<StaffSubmissionPaginationDetail>();

export interface SubmissionsMoaIaDetailForStaffColumnOptions {
    onVerifyDocument?: (submissionId: string, request: StaffVerifySubmissionRequest) => void;
    onFillFacultyLetterNumber?: (submissionId: string) => void;
    onViewPdf?: (submissionId: string) => void;

    isVerifyingUpdate?: boolean;
    verifyingSubmissionId?: string | null;
}

export function getSubmissionsMoaIaDetailForStaffColumns(
    options: SubmissionsMoaIaDetailForStaffColumnOptions = {}
): ColumnDef<StaffSubmissionPaginationDetail, never>[] {
    return [
        submissionsMoaIaDetailForStaffColumnHelper.accessor('applicantStudyProgram', {
            header: 'Asal Prodi',
            cell: (info) => {
                const applicantStudyProgram = info.getValue() as string;

                const studyProgramLabel = studyProgramOptions.find(option => option.value === info.getValue())?.label || applicantStudyProgram;

                return (
                    <div className="max-w-50">
                        <p 
                            className="font-medium text-gray-900 truncate" 
                            title={applicantStudyProgram}
                        >
                            {studyProgramLabel}
                        </p>
                    </div>
                );
            },
            enableSorting: true, 
        }),

        submissionsMoaIaDetailForStaffColumnHelper.accessor('applicantFullname', {
            header: 'Nama Pemohon',
            cell: (info) => {
                const applicantFullname = displayFullName(info.getValue() as string);
                const applicantNim = info.row.original.applicantNim;

                return (
                    <div className="max-w-50">
                        <p 
                            className="font-medium text-gray-900 truncate capitalize" 
                            title={applicantFullname}
                        >
                            {applicantFullname}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {applicantNim}
                        </p>
                    </div>
                );
            },
            enableSorting: true, 
        }),

        submissionsMoaIaDetailForStaffColumnHelper.accessor('submissionStatus', {
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

        submissionsMoaIaDetailForStaffColumnHelper.display({
            id: 'actions', 
            header: '',    
            cell: (info) => {
                const submissionId = info.row.original.submissionId;
                const isThisRowVerifying =
                        !!options.isVerifyingUpdate &&
                        options.verifyingSubmissionId === submissionId;

            return (
                <div className="flex items-center gap-1">
                    <button
                        className="rounded-full p-2 cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Verifikasi Dokumen"
                        disabled={isThisRowVerifying}
                        onClick={() =>
                            options.onVerifyDocument?.(submissionId, {
                            submissionStatus: "verified_staff",
                            })
                        }
                    >
                    {isThisRowVerifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="h-4 w-4" />
                    )}
                    </button>

                    <button
                        className="rounded-full p-2 cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Isi Nomor Surat Fakultas"
                        onClick={() => options.onFillFacultyLetterNumber?.(submissionId)}
                    >
                    <PencilIcon className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => options.onViewPdf?.(submissionId)}
                        className="rounded-full p-2 cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Lihat Dokumen"
                    >
                    <FileText className="h-4 w-4" />
                    </button>
                </div>
            );
            },
            enableSorting: false,  
        }),
    ]
}