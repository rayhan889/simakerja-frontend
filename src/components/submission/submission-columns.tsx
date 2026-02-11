import type { DocumentActivity, MoAIASubmission, Submission } from "@/types/submission.type";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const submissionColumnHelper = createColumnHelper<Submission>();
const moaIaSubmissionColumnHelper = createColumnHelper<MoAIASubmission>();

const activityLabels: Record<DocumentActivity, string> = {
  internship: 'Magang',
  study_independent: 'Studi Independen',
  kkn: 'KKN',
  research: 'Penelitian',
  community_service: 'Pengabdian Masyarakat',
};

const documentTypeLabels: Record<string, string> = {
  moa: 'MoA',
  ia: 'IA',
};

// TODO: lengkapi kolom habis endpoint jadi
// export const submissionColumns: ColumnDef<Submission, unknown>[] = [
//     submissionColumnHelper.accessor()
// ]

export const moaIASubmissionColumns: ColumnDef<MoAIASubmission, never>[] = [
    moaIaSubmissionColumnHelper.accessor('partnerName', {
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
        enableSorting: true, 
    }),

  moaIaSubmissionColumnHelper.accessor('documentType', {
    header: 'Jenis',
    cell: (info) => {
      const type = info.getValue() as string;
      return (
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          {documentTypeLabels[type] || type.toUpperCase()}
        </span>
      );
    },
    enableSorting: true,
  }),

  moaIaSubmissionColumnHelper.accessor('documentActivity', {
    header: 'Bentuk Kerjasama',
    cell: (info) => {
      const activity = info.getValue() as DocumentActivity;
      return (
        <span className="text-gray-600">
          {activityLabels[activity] || activity}
        </span>
      );
    },
    enableSorting: true,
  }),

  moaIaSubmissionColumnHelper.accessor(
    (row) => row.studentSnapshot.total,
    {
      id: 'studentCount', 
      header: 'Jumlah Mahasiswa',
      cell: (info) => (
        <span className="text-gray-600">
          {info.getValue()} orang
        </span>
      ),
      enableSorting: false,
    }
  ),

  moaIaSubmissionColumnHelper.accessor('facultyRepresentativeName', {
    header: 'Perwakilan Fakultas',
    cell: (info) => (
      <span className="text-gray-600 truncate max-w-[150px] block">
        {info.getValue()}
      </span>
    ),
    enableSorting: true,
  }),

  moaIaSubmissionColumnHelper.accessor('partnerRepresentativeName', {
    header: 'Perwakilan Mitra',
    cell: (info) => {
      const name = info.getValue() as string;
      const position = info.row.original.partnerRepresentativePosition;
      
      return (
        <div className="max-w-[150px]">
          <p className="text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate">{position}</p>
        </div>
      );
    },
    enableSorting: true,
  }),

  moaIaSubmissionColumnHelper.display({
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
        
        <button
          onClick={() => {
            console.log('More options:', info.row.original);
          }}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title="Opsi lainnya"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    ),
    enableSorting: false,  // 
  }),
]