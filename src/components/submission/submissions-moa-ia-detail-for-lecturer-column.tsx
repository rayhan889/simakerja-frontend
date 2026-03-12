import { displayFullName } from "@/lib/display-fullname";
import type { LecturerSubmissionPaginationDetail, SubmissionStatus } from "@/types/submission.type";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { FileSearchCorner } from "lucide-react";
import { displaySubmissionStatus, getStatusBadgeColor } from "@/lib/display-status";


const submissionsMoaIaDetailForLecturerColumnHelper = createColumnHelper<LecturerSubmissionPaginationDetail>();

export type SubmissionsMoaIaDetailForLecturerColumnOptions = {
    onProcessSubmission?: (submissionId: string) => void;
}

export function getSubmissionsMoaIaDetailForLecturerColumns(
    options: SubmissionsMoaIaDetailForLecturerColumnOptions = {}
): ColumnDef<LecturerSubmissionPaginationDetail, never>[] {
    return [

        submissionsMoaIaDetailForLecturerColumnHelper.accessor('applicantFullname', {
            header: 'Nama Pemohon',
            cell: (info) => {
                const applicantFullname = displayFullName(info.getValue() as string);
                const applicantNim = info.row.original.applicantNim;

                return (
                    <div className="max-w-50">
                        <p 
                            className="font-medium text-gray-900 capitalize" 
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

        submissionsMoaIaDetailForLecturerColumnHelper.accessor('submissionStatus', {
            header: 'Status',
            cell: (info) => {
                const status = info.getValue() as SubmissionStatus;
                return (
                    <Badge 
                        variant={'secondary'}
                        className={getStatusBadgeColor(status)}
                    >
                        {displaySubmissionStatus(status)}
                    </Badge>
                );
            },
            enableSorting: false
        }),

        submissionsMoaIaDetailForLecturerColumnHelper.display({
            id: 'actions', 
            header: '',    
            cell: (info) => {
            const submissionId = info.row.original.submissionId;

            return (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => options.onProcessSubmission?.(submissionId)}
                        className="rounded-full p-2 cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Proses Pengajuan"
                    >
                        <FileSearchCorner className="h-4 w-4" />
                    </button>
                </div>
            );
            },
            enableSorting: false,  
        }),
    ]
}