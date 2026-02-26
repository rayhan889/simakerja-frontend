import { cn } from "@/lib/utils"
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type OnChangeFn, type PaginationState, type SortingState } from "@tanstack/react-table"
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]

    data: TData[]

    totalItems: number

    totalPages: number

    pagination: PaginationState

    onPaginationChange: OnChangeFn<PaginationState>

    sorting: SortingState

    onSortingChange: OnChangeFn<SortingState>

    isLoading?: boolean

    pageSizeOptions?: number[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
    totalItems,
    totalPages,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    isLoading = false,
    pageSizeOptions = [10, 20, 50, 100],
}: DataTableProps<TData, TValue>) {
    

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualSorting: true,
        pageCount: totalPages,
        state: {
            pagination,
            sorting
        },
        onPaginationChange,
        onSortingChange,
        getCoreRowModel: getCoreRowModel()
    })

    return (
        <div className="space-y-4 w-full ">
        <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
            
            <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    
                    return (
                        <th
                        key={header.id}
                        className={cn(
                            'px-4 py-3 text-left text-xs font-medium',
                            'text-gray-500 uppercase tracking-wider',
                            canSort && 'cursor-pointer select-none hover:bg-gray-100'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        >
                        <div className="flex items-center gap-2">
                            {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                            
                            {canSort && (
                            <span className="text-gray-400">
                                {sorted === 'asc' ? (
                                <ChevronUp className="h-4 w-4" />
                                ) : sorted === 'desc' ? (
                                <ChevronDown className="h-4 w-4" />
                                ) : (
                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                )}
                            </span>
                            )}
                        </div>
                        </th>
                    );
                    })}
                </tr>
                ))}
            </thead>
            
            <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                Array.from({ length: pagination.pageSize }).map((_, rowIdx) => (
                    <tr key={`skeleton-row-${rowIdx}`}>
                    {columns.map((_, colIdx) => (
                        <td key={`skeleton-cell-${colIdx}`} className="px-4 py-3">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                        </td>
                    ))}
                    </tr>
                ))
                ) : data.length === 0 ? (
                <tr>
                    <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-500"
                    >
                    <div className="flex flex-col items-center gap-2">
                        <svg 
                        className="h-12 w-12 text-gray-300" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                        </svg>
                        <p>Tidak ada data ditemukan</p>
                    </div>
                    </td>
                </tr>
                ) : (
                table.getRowModel().rows.map((row) => (
                    <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                    >
                    {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-gray-900">
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </td>
                    ))}
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        <div className="flex items-center justify-between px-2">
            
            <p className="text-sm text-gray-500">
            Menampilkan{' '}
            <span className="font-medium">
                {totalItems === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1}
            </span>
            {' - '}
            <span className="font-medium">
                {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                totalItems
                )}
            </span>
            {' dari '}
            <span className="font-medium">{totalItems}</span> data
            </p>

            <div className="flex items-center gap-6">
            
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Per halaman:</span>
                <select
                className={cn(
                    'rounded-md border border-gray-300 bg-white',
                    'px-3 py-1.5 text-sm',
                    'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                )}
                value={pagination.pageSize}
                onChange={(e) => {
                    onPaginationChange({
                    pageIndex: 0,
                    pageSize: Number(e.target.value),
                    });
                }}
                >
                {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                    {size}
                    </option>
                ))}
                </select>
            </div>

            <div className="flex items-center gap-1">
                <button
                className={cn(
                    'rounded-md border border-gray-300 bg-white',
                    'px-3 py-1.5 text-sm font-medium',
                    'hover:bg-gray-50 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
                )}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                Sebelumnya
                </button>

                <div className="flex items-center gap-1 mx-2">
                {generatePageNumbers(pagination.pageIndex, totalPages).map(
                    (pageNum, idx) =>
                    pageNum === '...' ? (
                        <span 
                        key={`ellipsis-${idx}`} 
                        className="px-2 text-gray-400"
                        >
                        ...
                        </span>
                    ) : (
                        <button
                        key={pageNum}
                        className={cn(
                            'min-w-[32px] rounded-md px-3 py-1.5 text-sm font-medium',
                            pagination.pageIndex === pageNum
                            ? 'bg-primary text-white'  // Current page
                            : 'border border-gray-300 bg-white hover:bg-gray-50'
                        )}
                        onClick={() =>
                            onPaginationChange({
                            ...pagination,
                            pageIndex: pageNum as number,
                            })
                        }
                        >
                        {(pageNum as number) + 1}
                        </button>
                    )
                )}
                </div>

                <button
                className={cn(
                    'rounded-md border border-gray-300 bg-white',
                    'px-3 py-1.5 text-sm font-medium',
                    'hover:bg-gray-50 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
                )}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                >
                Selanjutnya
                </button>
            </div>
            </div>
        </div>
        </div>
    )
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | '...')[] = [];
  
  pages.push(0);
  
  if (currentPage > 2) {
    pages.push('...');
  }
  
  for (
    let i = Math.max(1, currentPage - 1);
    i <= Math.min(totalPages - 2, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }
  
  if (currentPage < totalPages - 3) {
    pages.push('...');
  }
  
  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages - 1);
  }
  
  return pages;
}