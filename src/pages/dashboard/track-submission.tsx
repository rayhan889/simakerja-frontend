import { DataTable } from "@/components/data-table/data-table";
import { getSubmissionByUserIdAndMoATypeColumns } from "@/components/submission/submissions-by-userid-and-moa-ia-type-column";
import { useAuth } from "@/hooks/use-auth";
import { useSubmissionsByUserIdAndMoAIAType } from "@/hooks/use-submission";
import { type QueryParams, toSpringSort } from "@/types/table.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState, useMemo, useCallback } from "react";
import { buttonVariants } from '@/components/ui/button';
import { Link, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Send } from 'lucide-react'
import { PDFViewerDialog } from "@/components/submission/pdf-viewer-dialog";
import type { SubmissionsByUserIdAndMoAIAType, SubmissionStatus } from "@/types/submission.type";

export const DashboardTrackSubmissionPage = () => {

  const { user } = useAuth();
  const userId = user?.id || "";
  const isStudent = user?.role === 'student';
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [sorting, setSorting] = useState<SortingState>([])

  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    id: string;
    partnerName: string;
    status: SubmissionStatus
  } | null>(null);

  const queryParams = useMemo<QueryParams>(() => ({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: toSpringSort(sorting),
  }), [pagination.pageIndex, pagination.pageSize, sorting])

  const {
    data,
    isLoading,
    isError,
    error
  } = useSubmissionsByUserIdAndMoAIAType(queryParams, userId, isStudent ? user?.nim : undefined);

  const tableData = data?.content ?? [];
  const totalItems = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const handleViewPdf = useCallback((submissionId: string, partnerName: string, status: SubmissionStatus) => {
    setSelectedSubmission({ id: submissionId, partnerName, status });
    setPdfDialogOpen(true);
  }, []);

  const handleEdit = useCallback((submission: SubmissionsByUserIdAndMoAIAType) => {
    navigate(`/dashboard/submission/${submission.submissionId}/edit`);
  }, [navigate]);

  const canEditSubmission = useCallback(
    (submission: SubmissionsByUserIdAndMoAIAType) => {
      if (!isStudent) return false;
      if (submission.applicantId !== userId) return false;

      return (
        submission.status === "pending" || submission.status === "in_process" || submission.status === 'rejected_adhoc' || submission.status === 'verified_staff'
      );
    },
    [isStudent, userId]
  );

  const columns = useMemo(
    () => getSubmissionByUserIdAndMoATypeColumns({
      onViewPdf: handleViewPdf,
      onEdit: handleEdit,
      canEdit: canEditSubmission,
    }),
    [handleViewPdf, handleEdit, canEditSubmission]
  );

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8">
        <div className="flex flex-col items-center text-center">
          <svg
            className="h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-red-800">
            Gagal Memuat Data
          </h3>
          <p className="mt-2 text-sm text-red-600">
            {error?.message || 'Terjadi kesalahan saat memuat data pengajuan.'}
          </p>
          <button
            onClick={() => globalThis.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Lacak Pengajuan MoA IA
          </h1>
        </div>

      </div>

      <div className="flex  w-full items-center justify-between gap-4">

        <Link
          to='/dashboard/submit-submission'
          className={
            cn(buttonVariants({ size: 'lg' }), 'cursor-pointer bg-teal-950 text-white flex items-center self-end justify-end hover:bg-teal-800 ')}
        >
          <Send className="mr-2 h-4 w-4" />
          <span className="font-medium">Ajukan Dokumen</span>
        </Link>
      </div>

      <DataTable
        columns={columns}

        data={tableData}
        totalItems={totalItems}
        totalPages={totalPages}

        pagination={pagination}
        onPaginationChange={setPagination}

        sorting={sorting}
        onSortingChange={setSorting}

        isLoading={isLoading}

        pageSizeOptions={[10, 20, 50]}
      />

      <PDFViewerDialog
        submissionId={selectedSubmission?.id ?? null}
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        allowDownload={selectedSubmission?.status === 'verified_staff' || selectedSubmission?.status === 'completed'}
      />
    </div>
  );
}
