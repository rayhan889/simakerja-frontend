import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { getSubmissionsMoaIaDetailForLecturerColumns } from "@/components/submission/submissions-moa-ia-detail-for-lecturer-column"
import { Button } from "@/components/ui/button"
import { useMoaIASubmissionsDetailForLecturer } from "@/hooks/use-submission"
import { activityLabels, type ActivityType } from "@/types/submission.type"
import { toSpringSort, type QueryParams } from "@/types/table.types"
import type { PaginationState, SortingState } from "@tanstack/react-table"
import { ArrowLeft, Loader2, X } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"

const DashboardLecturerTrackSubmissionDetail = () => {

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const period = searchParams.get("period") || ""
    const partnerName = searchParams.get("partnerName") || ""
    const activityTypeParam = (searchParams.get("activityType") ||
        "") as ActivityType

    const displayFormattedPeriod = useMemo(() => {
        if (!period) return ""
        const [year, month] = period.split("-")
        const date = new Date(Number(year), Number(month) - 1)
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    }, [period])

    const missingRequired =
        !period || !partnerName || !activityTypeParam

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const [sorting, setSorting] = useState<SortingState>([])

    const [search, setSearch] = useState<string>("")

    const queryParams = useMemo<QueryParams>(
        () => ({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sort: toSpringSort(sorting),
        search: search.trim() || undefined,
        }),
        [pagination.pageIndex, pagination.pageSize, sorting, search],
    )

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    } = useMoaIASubmissionsDetailForLecturer(
        queryParams,
        partnerName,
        period,
        activityTypeParam,
    )

    const tableData = data?.content ?? []
    const totalItems = data?.totalElements ?? 0
    const totalPages = data?.totalPages ?? 0

    const handleProcessDocument = useCallback(
        (submissionId: string) => {
            navigate(`/dashboard/lecturer-process-submission/${submissionId}`)
        },
        [navigate],
    )

    const columns = useMemo(
        () => getSubmissionsMoaIaDetailForLecturerColumns({
            onProcessSubmission: handleProcessDocument
        }),
        [handleProcessDocument],
    );
    
    const handleSearchChange = useCallback((value: string) => {
        setSearch(value)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, [])

  if (missingRequired) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8">
        <div className="flex flex-col items-center text-center">
          <h3 className="mt-2 text-lg font-medium text-yellow-800">
            Parameter tidak lengkap
          </h3>
          <p className="mt-2 text-sm text-yellow-700">
            Halaman ini memerlukan informasi periode, nama mitra, dan
            bentuk kerjasama. Silakan akses dari halaman daftar pengajuan
            staf.
          </p>
          <button
            onClick={() => navigate("/dashboard/staff-track-submission")}
            className="mt-4 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 transition-colors"
          >
            Kembali ke daftar pengajuan
          </button>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8">
        <div className="flex flex-col items-center text-center">
          <X className="h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-red-800">
            Gagal Memuat Data
          </h3>
          <p className="mt-2 text-sm text-red-600">
            {error?.message || 'Terjadi kesalahan saat memuat data pengajuan.'}
          </p>
          <Button
            onClick={() => globalThis.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full flex flex-col space-y-3  items-start'>
        <Button
            variant={'link'}
            className='cursor-pointer'
        >
            <span className='text-sm' onClick={() => navigate('/dashboard/lecturer-track-submission')}>
                <ArrowLeft className="h-4 w-4 inline mr-1" /> Kembali ke Daftar Pengajuan
            </span>
        </Button>

        <div className="bg-white rounded-lg border border-gray-200 w-full flex items-center p-5 gap-x-6">

            <div className='flex flex-col items-start w-full border-r border-gray-200'>
                <p className='text-sm text-gray-500'>Nama Mitra</p>
                <span className='font-medium'>{partnerName}</span>
            </div>
            
            <div className='flex flex-col items-start w-full border-r border-gray-200'>
                <p className='text-sm text-gray-500'>Periode Pengajuan</p>
                <span className='font-medium'>{displayFormattedPeriod}</span>
            </div>
            
            <div className='flex flex-col items-start w-full'>
                <p className='text-sm text-gray-500'>Jenis Kegiatan</p>
                <span className='font-medium'>{activityLabels[activityTypeParam] || activityTypeParam}</span>
            </div>

        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 ">
            <div>
                <h1 className="text-lg font-semibold text-gray-900">
                    Detail Lacak Dokumen MoA & IA Mahasiswa
                </h1>
            </div>

            <div className="flex w-full items-center justify-between gap-4">
                <DataTableSearch
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari nama pemohon..."
                className="w-80"
                debounceMs={300}
                />

                <div className="flex items-center gap-3">
                {isFetching && !isLoading && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memperbarui...
                    </div>
                )}
                </div>
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
        </div>
    </div>
  )
}

export default DashboardLecturerTrackSubmissionDetail