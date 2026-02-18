import type { SortingState, PaginationState } from "@tanstack/react-table"

export interface QueryParams {
    page: number;
    size: number;
    sort?: string;
    search?: string;
}

export interface SearchParams {
    search?: string;
}

export interface DataTableConfig {
    enableSearch?: boolean;
    searchPlaceholder?: string;
    defaultPageSize?: number;
    pageSizeOptions?: number[];
}

export const defaultTableConfig: DataTableConfig = {
    enableSearch: false,
    searchPlaceholder: "",
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
}

// convert QueryParams to Spring Data JPA sort format
export function toSpringSort(sort: SortingState): string | undefined {
    if (sort.length === 0) return undefined;
    
    const sortItem = sort[0];
    return `${sortItem.id},${sortItem.desc ? 'desc' : 'asc'}`;
}

export function toSpringPagination(pagination: PaginationState): Pick<QueryParams, 'page' | 'size'> {
    return {
        page: pagination.pageIndex,
        size: pagination.pageSize,
    }
}