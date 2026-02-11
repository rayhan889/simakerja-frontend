import { useMoaIASubmissions } from '@/hooks/use-submission'
import { toSpringSort, type QueryParams } from '@/types/table.types'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { DataTable } from '../data-table/data-table'
import { moaIASubmissionColumns } from '../submission/submission-columns'
import { DataTableSearch } from '../data-table/data-table-search'

export const DashboardSubmissionHistory = () => {

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
  } = useMoaIASubmissions(queryParams)

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
    <div className="space-y-6">
      {/* ----- PAGE HEADER ----- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pengajuan MoA/IA
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Daftar dokumen Memorandum of Agreement dan Implementation Agreement
          </p>
        </div>
        
        {/* Add New Button */}
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajukan Dokumen
        </button>
      </div>

      {/* ----- TABLE CONTROLS ----- */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Input */}
        {/* ✅ This endpoint supports search, so we show the input */}
        <DataTableSearch
          value={search}
          onChange={handleSearchChange}
          placeholder="Cari nama mitra..."
          className="w-80"
          debounceMs={300}
        />

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Fetching indicator (shows during refetch, not initial load) */}
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
          
          {/* Optional: Filter dropdown could go here */}
        </div>
      </div>

      {/* ----- DATA TABLE ----- */}
      <DataTable
        // Column configuration
        columns={moaIASubmissionColumns}
        
        // Data from API
        data={tableData}
        totalItems={totalItems}
        totalPages={totalPages}
        
        // Pagination (controlled)
        pagination={pagination}
        onPaginationChange={setPagination}
        
        // Sorting (controlled)
        sorting={sorting}
        onSortingChange={setSorting}
        
        // Loading state
        isLoading={isLoading}
        
        // Page size options
        pageSizeOptions={[10, 20, 50]}
      />
    </div>
  );
}
