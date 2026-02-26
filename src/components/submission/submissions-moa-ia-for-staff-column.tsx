import type { ActivityType, StaffSubmissionPagination } from "@/types/submission.type";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

const submissionsMoaIaForStaffColumnHelper = createColumnHelper<StaffSubmissionPagination>();

export interface SubmissionsMoaIaForStaffColumnOptions {
    onViewDetail?: (period: string, partnerName: string, activityType: string) => void;
}

export function getSubmissionsMoaIaForStaffColumns(
    options: SubmissionsMoaIaForStaffColumnOptions = {}
): ColumnDef<StaffSubmissionPagination, never>[] {
    return [
        submissionsMoaIaForStaffColumnHelper.accessor('period', {
            header: 'Periode Pengajuan',
            cell: (info) => {
                const periodFormat = new Date(info.getValue() as string).toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric',
                });
                
                return (
                    <div className="max-w-50">
                        <p 
                            className="font-medium text-gray-900 truncate" 
                            title={periodFormat}
                        >
                            {periodFormat}
                        </p>
                    </div>
                );
            },
            enableSorting: true, 
        }),

        submissionsMoaIaForStaffColumnHelper.accessor('partnerName', {
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

        submissionsMoaIaForStaffColumnHelper.accessor('activityType', {
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

        submissionsMoaIaForStaffColumnHelper.accessor('totalSubmissions', {
            header: 'Jumlah Pengajuan',
            cell: (info) => {
                const totalSubmissions = info.getValue() as number;
                
                return (
                    <div className="max-w-50">
                        <p 
                            className="font-medium text-gray-900 truncate" 
                            title={`${totalSubmissions} pengajuan`}
                        >
                            {totalSubmissions}
                        </p>
                    </div>
                );
            },
            enableSorting: false, 
        }),

        submissionsMoaIaForStaffColumnHelper.display({
            id: 'actions', 
            header: '',    
            cell: (info) => {
                const { period, partnerName, activityType } = info.row.original;

                return (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => options.onViewDetail!(period, partnerName, activityType as string)}
                            className="rounded-full p-2 cursor-pointer text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            title="Lihat Dokumen"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    </div>
                );
            },
            enableSorting: false,  
        }),
    ]
}