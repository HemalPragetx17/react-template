import type { ORDER_BY_ENUM, ORDER_BY_TYPE } from "../../shared/constants/pagination";

export interface IBaseCreateRequest {
    _createdBy?: number;
    _createdAt?: Date | string;
}

export interface IBaseUpdateRequest {
    _updatedBy?: number;
    _updatedAt?: Date | string;
}

export interface IColumn {
    /* Column's name, as defined by columns.name. */
    name?: string;
    /* Column's data source, as defined by columns.data. */
    data?: string;
    /* Flag to indicate if this column is orderable (true) or not (false) */
    orderable?: boolean;
    /* Flag to indicate if this column is Searchable (true) or not (false) */
    searchable?: boolean;
    /* Specific search value. */
    search?: string;
    /* For Width of column */
    width?: number;
    /* For css of column */
    className?: string;
    datas? : string;
    dataset?: string;
}

export interface IOrder {
    column: number;
    dir: ORDER_BY_ENUM;
}

export interface SearchResult<T> {
    results: T[];
    count: number;
    total: number;
}

export interface Pagination {
    sort?: ORDER_BY_TYPE;
    sort_by?: string;
    limit: number;
    page: number;
}
