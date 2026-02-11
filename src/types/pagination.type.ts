export interface PaginationResponese<T> {
    content: T[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: Pageable;
    size: number;
    sort: Sort;
    totalElements: number;
    totalPages: number;
}

export interface Pageable {
    offset: number;
    pageNumber: number;
    pageSize: number;

}

export interface Sort {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}