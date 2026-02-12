import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { submissionByUserIdAndMoATypeColumns } from "@/components/submission/submissions-by-userid-and-moa-ia-type-column";
import { useAuth } from "@/hooks/use-auth";
import { useSubmissionsByUserIdAndMoAIAType } from "@/hooks/use-submission";
import { type QueryParams, toSpringSort } from "@/types/table.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState, useMemo, useCallback } from "react";
import { buttonVariants } from '@/components/ui/button';
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { Send } from 'lucide-react'

export const DashboardTrackSubmissionPage = () => {
  
  const { user } = useAuth();
    const userId = user?.id || "";
  
    const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })
  
    const [sorting, setSorting] = useState<SortingState>([])
  
    const [search, setSearch] = useState<string>("")
  
    const queryParams = useMemo<QueryParams>(() => ({
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: toSpringSort(sorting),
      search: search.trim() || undefined,
    }), [pagination.pageIndex, pagination.pageSize, sorting, search])
  
    const {
      data,
      isLoading,
      isFetching,
      isError,
      error
    } = useSubmissionsByUserIdAndMoAIAType(queryParams, userId);
  
    const tableData = data?.content ?? [];
    const totalItems = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 0;
  
      const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }, []);
  
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
              onClick={() => window.location.reload()}
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
            <h1 className="text-2xl font-bold text-gray-900">
              Lacak Dokumen MoA & IA
            </h1>
          </div>
          
        </div>
  
        <div className="flex  w-full items-center justify-between gap-4">
          <DataTableSearch
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari nama mitra..."
            className="w-80"
            debounceMs={300}
          />
  
          <div className="flex items-center gap-3">
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Memperbarui...
              </div>
            )}
          </div>

          <Link
            to='/dashboard/submit-document'
            className={
              cn(buttonVariants({ size: 'lg' }), 'cursor-pointer bg-teal-950 text-white flex items-center hover:bg-teal-800 font-secondary')}
          >
            <Send className="mr-2 h-4 w-4" /> 
            <span className="font-medium">Ajukan Dokumen</span>
          </Link>
        </div>
  
        <DataTable
          columns={submissionByUserIdAndMoATypeColumns}
          
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
      </div>
    );
}
