import type { ActivityType, MoAIASubmissionType, SubmissionsByUserIdAndMoAIAType, SubmissionStatus } from "@/types/submission.type";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import { Eye } from "lucide-react";


const submissionByUserIdAndMoATypeColumnHelper = createColumnHelper<SubmissionsByUserIdAndMoAIAType>();

export const submissionByUserIdAndMoATypeColumns: ColumnDef<SubmissionsByUserIdAndMoAIAType, never>[] = [
    submissionByUserIdAndMoATypeColumnHelper.accessor('partnerName', {
        header: 'Nama Mitra',
        cell: (info) => {
        const partnerName = info.getValue() as string;
        const partnerNumber = info.row.original.partnerNumber;

        return (
            <div className="max-w-[200px]">
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
        enableSorting:false
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
        enableSorting:false
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
                >{
                    status == 'pending' ? 'Pending' :
                    status == 'in_process' ? 'Dalam Proses' :
                    status == 'verified_adhoc' ? 'Terverifikasi Adhoc' :
                    status == 'verified_staff' ? 'Terverifikasi Staff' :
                    status == 'rejected' ? 'Ditolak' :
                    status == 'completed' ? 'Selesai' : status
                }</Badge>
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
        cell: (info) => (
            <div className="flex items-center gap-1">
                <button
                onClick={() => {
                    console.log('View submission:', info.row.original);
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Lihat detail"
                >
                <Eye className="h-4 w-4" />
                </button>
            </div>
        ),
    enableSorting: false,  
  }),
]