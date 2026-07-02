import type { Pagination } from "../../models/base-type";
import { Digits } from "../enums/digits";


export const ORDER_BY_ASC = 'ascending';
export const ORDER_BY_DESC = 'descending';
export type ORDER_BY_TYPE = 'ascending' | 'descending';
export type ORDER_BY_ENUM = {
    asc: 'ascending',
    desc: 'descending',
};

export const Sorting = {
    ascending: 'asc',
    descending: 'desc',
};

export const DEFAULT_ORDERBY = 'created_at';
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_OPTIONS = [10, 20, 30, 40, 50];

export const PAGINATION: Pagination = {
    page: Digits.One,
    limit: DEFAULT_PAGE_SIZE,
};

export const SORTING: any = {
    column: DEFAULT_ORDERBY,
    direction: ORDER_BY_DESC,
};