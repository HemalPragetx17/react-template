/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ColumnDef,
  ExpandedState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    className?: string;
    headerClassName?: string;
    align?: "left" | "center" | "right";
  }
}

import clsx from "clsx";
import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaSpinner,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import AnimatedExpand from "./AnimatedExpand";
import "./index.css";
import type { IApplicationState } from "../../store/state/app-state";
import { Button, Checkbox, getRadiusClass } from "../ui";
import { PAGE_OPTIONS } from "../../shared/constants/pagination";

interface TanstackTableProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  getSubRows?: (row: T) => any[] | undefined;
  title?: string;
  className?: string;
  enablePagination?: boolean;
  pageSize?: number;
  enableFiltering?: boolean;
  enableExpanding?: boolean; // New flag to control expansion
  enableCheckbox?: boolean;
  enableSorting?: boolean;
  defaultSortKey?: string;
  defaultSortOrder?: "asc" | "desc";
  onRowClick?: (row: T) => void;
  hideHeader?: boolean;
  loading?: boolean;
  totalCount?: number;
  paginationSize?: "sm" | "md" | "lg";
  paginationColor?: "primary" | "secondary" | "success" | "warning" | "danger" | "default";
  paginationVariant?: "solid" | "bordered" | "light" | "flat";
  showPaginationControls?: boolean;
  scrollBehavior?: "inside" | "outside";
  manualPagination?: boolean;
  pagination?: { page: number; limit: number };
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  isStriped?: boolean;
  enableInfiniteScroll?: boolean;
  infiniteScrollStep?: number;
  infiniteScrollThreshold?: number;
  infiniteScrollMaxHeight?: string;
  hasMore?: boolean;
}

function Filter({ column, table }: { column: any; table: any }) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === "number" ? (
    <div className="d-flex gap-2">
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder="Min"
        className="form-control form-control-sm"
        style={{ width: "80px" }}
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder="Max"
        className="form-control form-control-sm"
        style={{ width: "80px" }}
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder="Search..."
      className="form-control form-control-sm"
      style={{ width: "150px" }}
    />
  );
}

function TanstackTable<T = any>({
  data,
  columns,
  getSubRows,
  // title,
  className,
  enablePagination = false,
  pageSize = 10,
  enableFiltering = false,
  enableExpanding = false, // Default to true for backward compatibility
  enableCheckbox = false,
  enableSorting = false,
  defaultSortKey,
  defaultSortOrder = "desc",
  onRowClick,
  hideHeader = false,
  loading = false,
  totalCount,
  paginationSize = "md",
  paginationColor = "primary",
  paginationVariant = "solid",
  showPaginationControls = true,
  scrollBehavior = "inside",
  manualPagination = true,
  pagination,
  onPaginationChange,
  isStriped = false,
  enableInfiniteScroll = false,
  infiniteScrollStep,
  infiniteScrollThreshold = 100,
  infiniteScrollMaxHeight = "24rem",
  hasMore,
}: TanstackTableProps<T>) {
  const globalTableLoading = useSelector((state: IApplicationState) => state.GeneralData?.tableLoading);
  const isLoading = loading || globalTableLoading;

  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>(
    defaultSortKey
      ? [{ id: defaultSortKey, desc: defaultSortOrder === "desc" }]
      : [],
  );

  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = React.useRef<HTMLDivElement>(null);
  const isFetchingMoreRef = React.useRef(false);
  const previousDataLengthRef = React.useRef(0);
  const scrollSnapshotRef = React.useRef<{ scrollTop: number; scrollHeight: number } | null>(null);

  const currentLimit = pagination?.limit ?? pageSize;
  const loadStep = infiniteScrollStep ?? pageSize;
  const canLoadMore = hasMore ?? (
    typeof totalCount === "number" ? currentLimit < totalCount : false
  );
  const isInitialLoading = isLoading && data.length === 0;
  const isLoadingMore = isLoading && data.length > 0;

  const loadMore = React.useCallback(() => {
    if (!enableInfiniteScroll || !onPaginationChange || isFetchingMoreRef.current) return;
    if (isLoading || !canLoadMore) return;

    isFetchingMoreRef.current = true;

    if (scrollContainerRef.current) {
      scrollSnapshotRef.current = {
        scrollTop: scrollContainerRef.current.scrollTop,
        scrollHeight: scrollContainerRef.current.scrollHeight,
      };
    }

    onPaginationChange({
      page: 1,
      limit: currentLimit + loadStep,
    });
  }, [
    enableInfiniteScroll,
    onPaginationChange,
    isLoading,
    canLoadMore,
    currentLimit,
    loadStep,
  ]);

  React.useEffect(() => {
    if (!isLoading) {
      isFetchingMoreRef.current = false;
    }
  }, [isLoading, currentLimit]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target as Node)) {
        setIsPageSizeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!enableInfiniteScroll) return;

    const container = scrollContainerRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      {
        root: container,
        rootMargin: `${infiniteScrollThreshold}px`,
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enableInfiniteScroll, infiniteScrollThreshold, loadMore, data.length]);

  React.useLayoutEffect(() => {
    if (!enableInfiniteScroll) {
      previousDataLengthRef.current = data.length;
      return;
    }

    const container = scrollContainerRef.current;
    const snapshot = scrollSnapshotRef.current;
    const grew = data.length > previousDataLengthRef.current && previousDataLengthRef.current > 0;

    if (container && snapshot && grew && !isLoading) {
      const heightDiff = container.scrollHeight - snapshot.scrollHeight;
      if (heightDiff > 0) {
        container.scrollTop = snapshot.scrollTop + heightDiff;
      }
      scrollSnapshotRef.current = null;
    }

    previousDataLengthRef.current = data.length;
  }, [enableInfiniteScroll, data.length, isLoading]);

  React.useLayoutEffect(() => {
    if (!enableInfiniteScroll || isLoading || !canLoadMore) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const hasOverflow = container.scrollHeight > container.clientHeight + 1;
    if (!hasOverflow) {
      loadMore();
    }
  }, [enableInfiniteScroll, isLoading, canLoadMore, loadMore, data.length]);

  // Convert 1-based external page to TanStack's 0-based pageIndex
  const reactTablePagination = enablePagination && pagination
    ? {
      pageIndex: enableInfiniteScroll ? 0 : pagination.page - 1,
      pageSize: pagination.limit,
    }
    : undefined;

  const handlePaginationChange = (updater: any) => {
    if (onPaginationChange) {
      const currentPagination = pagination || { page: 1, limit: 10 };
      const nextTableState = typeof updater === 'function' ? updater(reactTablePagination) : updater;

      if (enableInfiniteScroll) {
        onPaginationChange({
          page: 1,
          limit: nextTableState.pageSize,
        });
        return;
      }

      const limitChanged = currentPagination.limit !== nextTableState.pageSize;
      const nextPagination = {
        page: limitChanged ? 1 : nextTableState.pageIndex + 1,
        limit: nextTableState.pageSize,
      };

      onPaginationChange(nextPagination as any);
    }
  };

  const tableColumns = React.useMemo(() => {
    let processedColumns = [...columns];

    // Enable sorting on columns that have it explicitly enabled and global sorting is on
    if (enableSorting) {
      processedColumns = processedColumns.map((col) => ({
        ...col,
        enableSorting: col.enableSorting === true, // Only enable if explicitly set to true
      }));
    }

    const prependColumns: ColumnDef<T>[] = [];

    const hasExpanderColumn = processedColumns.some((col) => col.id === "expander");

    if (enableExpanding && !hasExpanderColumn) {
      prependColumns.push({
        id: "expander",
        header: "",
        size: 40,
        enableSorting: false,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <Button
              isIconOnly
              variant="light"
              color="default"
              onClick={(e) => {
                e.stopPropagation();
                row.getToggleExpandedHandler()();
              }}
              className="flex items-center justify-center w-6 h-6"
              aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
            >
              <FaChevronRight
                className="w-4 h-4 inline-block origin-center transition-transform duration-300 ease-in-out"
                style={{ transform: row.getIsExpanded() ? "rotate(90deg)" : "rotate(0deg)" }}
                aria-hidden
              />
            </Button>
          ) : null,
      });
    }

    if (enableCheckbox) {
      prependColumns.push({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center px-1">
            <Checkbox
              indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
              checked={table.getIsAllRowsSelected()}
              onChange={(checkedOrEvent: any) => {
                const checked = typeof checkedOrEvent === "boolean" ? checkedOrEvent : checkedOrEvent?.target?.checked;
                table.toggleAllRowsSelected(checked);
              }}
              className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-1">
            <Checkbox
              checked={row.getIsSelected()}
              indeterminate={row.getIsSomeSelected()}
              onChange={(checkedOrEvent: any) => {
                const checked = typeof checkedOrEvent === "boolean" ? checkedOrEvent : checkedOrEvent?.target?.checked;
                row.toggleSelected(checked);
              }}
              className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
            />
          </div>
        ),
        size: 40,
        enableSorting: false,
      });
    }

    if (prependColumns.length === 0) return processedColumns;

    return [...prependColumns, ...processedColumns];
  }, [columns, enableCheckbox, enableExpanding, enableSorting]);

  const table = useReactTable({
    data,
    columns: tableColumns as any,
    getRowId: (row: any, index: number) => row._id || row.id || index.toString(),
    state: {
      expanded: enableExpanding ? expanded : {}, // Only manage expanded state if enabled
      rowSelection,
      sorting: enableSorting && !enableInfiniteScroll ? sorting : [],
      ...(enablePagination && reactTablePagination ? { pagination: reactTablePagination } : {}),
    },
    enableRowSelection: enableCheckbox,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: enableExpanding ? setExpanded : undefined,
    onSortingChange: enableSorting ? setSorting : undefined,
    onPaginationChange: enablePagination && onPaginationChange ? handlePaginationChange : undefined,
    manualPagination: manualPagination,
    pageCount: manualPagination && totalCount !== undefined ? Math.ceil(totalCount / (pagination?.limit || pageSize)) : undefined,
    getSubRows: enableExpanding ? (getSubRows as any) : undefined,
    getRowCanExpand: enableExpanding ? undefined : () => false, // Disable expansion when flag is false
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination && !enableInfiniteScroll
      ? getPaginationRowModel()
      : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined, // Only enable expanded row model if needed
    getSortedRowModel: enableSorting && !enableInfiniteScroll ? getSortedRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const paginationRange = (
    current: number,
    total: number,
    maxPages: number = 5,
  ) => {
    let delta = Math.floor(maxPages / 2);
    let range: (number | string)[] = [];
    let left = Math.max(1, current - delta);
    let right = Math.min(total, current + delta);

    if (right - left + 1 < maxPages) {
      if (left === 1) {
        right = Math.min(total, left + maxPages - 1);
      } else if (right === total) {
        left = Math.max(1, right - maxPages + 1);
      }
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 2) {
      range.unshift("...");
    }
    if (left > 1) {
      range.unshift(1);
    }

    if (right < total - 1) {
      range.push("...");
    }
    if (right < total) {
      range.push(total);
    }

    return range;
  };

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pages = paginationRange(currentPage, totalPages, 5);
  const colSpan = table.getVisibleLeafColumns().length;

  return (
    <div
      className={clsx(
        `flex flex-col bg-white dark:bg-content1 border border-default-100 dark:border-transparent ${getRadiusClass()} shadow-sm w-full overflow-hidden mt-5`,
        className,
      )}
    >
      <div
        ref={scrollContainerRef}
        className={clsx(
          "min-h-0",
          enableInfiniteScroll || scrollBehavior === "inside"
            ? "flex-1 overflow-auto"
            : "h-fit overflow-visible",
        )}
        style={enableInfiniteScroll ? { maxHeight: infiniteScrollMaxHeight } : undefined}
      >
        <table className="min-w-full divide-y divide-default-100 dark:divide-transparent border-collapse m-0">
          {!hideHeader && (
            <thead className={clsx(
              "z-20 bg-gray-50 dark:bg-neutral-900/40 shadow-[0_1px_0_0_var(--color-default-100)] dark:shadow-none",
              (enableInfiniteScroll || scrollBehavior === "inside") && "sticky top-0"
            )}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={clsx(
                        "px-6 py-4 text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider bg-gray-50 dark:bg-neutral-900/30 whitespace-nowrap",
                        header.column.columnDef.meta?.align === "center" && "text-center",
                        header.column.columnDef.meta?.align === "right" && "text-right",
                        (!header.column.columnDef.meta?.align || header.column.columnDef.meta?.align === "left") && "text-left",
                        header.column.columnDef.meta?.headerClassName
                      )}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={clsx(
                            "flex items-center gap-2",
                            header.column.columnDef.meta?.align === "center" && "justify-center",
                            header.column.columnDef.meta?.align === "right" && "justify-end",
                            (!header.column.columnDef.meta?.align || header.column.columnDef.meta?.align === "left") && "justify-start",
                            enableSorting &&
                            !enableInfiniteScroll &&
                            header.column.getCanSort() &&
                            "cursor-pointer select-none",
                          )}
                          onClick={
                            enableSorting && !enableInfiniteScroll && header.column.getCanSort()
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {enableSorting && !enableInfiniteScroll && header.column.getCanSort() && (
                            <div className="flex flex-col">
                              {{
                                asc: (
                                  <FaChevronUp className="w-3 h-3 text-gray-400" aria-hidden />
                                ),
                                desc: (
                                  <FaChevronDown className="w-3 h-3 text-gray-400" aria-hidden />
                                ),
                              }[header.column.getIsSorted() as string] ?? (
                                  <div className="flex flex-col opacity-30">
                                    <FaChevronUp className="w-3 h-3 text-gray-400" aria-hidden />
                                    <FaChevronDown className="w-3 h-3 text-gray-400 -mt-1" aria-hidden />
                                  </div>
                                )}
                            </div>
                          )}
                          {enableFiltering && header.column.getCanFilter() ? (
                            <div className="mt-2">
                              <Filter column={header.column} table={table} />
                            </div>
                          ) : null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          )}
          <tbody className="bg-white dark:bg-content1 divide-y divide-default-100 dark:divide-transparent">
            {isInitialLoading ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-8">
                  <div className="flex justify-center items-center text-gray-500">
                    <FaSpinner className="animate-spin h-5 w-5 mr-3 text-primary" aria-hidden />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows
                .filter((row) => row.depth === 0)
                .map((row, rowIndex) => {
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={clsx(
                        "transition-colors",
                        isStriped && rowIndex % 2 === 1 ? "bg-gray-50 dark:bg-neutral-900/20" : "bg-white dark:bg-content1",
                        isStriped ? "hover:bg-gray-100 dark:hover:bg-default-200" : "hover:bg-gray-50 dark:hover:bg-default-200",
                        onRowClick && "cursor-pointer",
                      )}
                        onClick={() => onRowClick?.(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={clsx(
                              "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-neutral-200 font-medium",
                              cell.column.columnDef.meta?.align === "center" && "text-center",
                              cell.column.columnDef.meta?.align === "right" && "text-right",
                              (!cell.column.columnDef.meta?.align || cell.column.columnDef.meta?.align === "left") && "text-left",
                              cell.column.columnDef.meta?.className
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>

                      {enableExpanding && row.getCanExpand() && (
                        <AnimatedExpand expanded={row.getIsExpanded()} colSpan={colSpan}>
                          <table className="w-full min-w-full border-collapse">
                            <tbody className="divide-y divide-default-100 dark:divide-transparent">
                              {row.subRows?.map((subRow) => (
                                <tr
                                  key={subRow.id}
                                  className={clsx(
                                    "bg-gray-50 hover:bg-gray-100 dark:bg-neutral-900/10 dark:hover:bg-default-200 transition-colors",
                                    onRowClick && "cursor-pointer",
                                  )}
                                  onClick={() => onRowClick?.(subRow.original)}
                                >
                                  {subRow.getVisibleCells().map((cell) => (
                                    <td
                                      key={cell.id}
                                      className={clsx(
                                        "px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium",
                                        cell.column.columnDef.meta?.align === "center" && "text-center",
                                        cell.column.columnDef.meta?.align === "right" && "text-right",
                                        (!cell.column.columnDef.meta?.align || cell.column.columnDef.meta?.align === "left") && "text-left",
                                        cell.column.columnDef.meta?.className
                                      )}
                                    >
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </AnimatedExpand>
                      )}
                    </React.Fragment>
                  );
                })
            ) : (
              <tr>
                <td colSpan={colSpan} className="text-center py-8">
                  <span className="text-sm font-medium text-gray-500">
                    No data found
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {enableInfiniteScroll && (
          <div ref={loadMoreSentinelRef} className="h-px w-full shrink-0" aria-hidden />
        )}
      </div>

      {enableInfiniteScroll && (
        <div className="flex items-center justify-center px-6 py-3 bg-white dark:bg-content1 border-t border-default-100 dark:border-transparent">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaSpinner className="animate-spin h-4 w-4 text-primary" aria-hidden />
              Loading more...
            </div>
          ) : canLoadMore ? (
            <span className="text-sm text-gray-400">Scroll down to load more</span>
          ) : (
            <span className="text-sm text-gray-400">
              Showing {data.length} of {typeof totalCount === "number" ? totalCount : data.length} items
            </span>
          )}
        </div>
      )}

      {enablePagination && !enableInfiniteScroll && (
        <div className={clsx(
          "flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-content1 border-t border-default-100 dark:border-transparent gap-4",
          scrollBehavior === "inside" && "sticky bottom-0 z-20 shadow-[0_-1px_0_0_var(--color-default-100)] dark:shadow-none"
        )}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap font-semibold">Rows per page:</span>
              <div className="relative" ref={pageSizeRef}>
                <button
                  type="button"
                  onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                  className="flex items-center justify-between gap-2 min-w-[70px] bg-gray-50 dark:bg-default-100 border border-gray-200 dark:border-default-200 text-gray-700 dark:text-neutral-300 text-sm rounded-xl px-3 py-1.5 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-default-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <span>{table.getState().pagination.pageSize}</span>
                  <FaChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isPageSizeOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {isPageSizeOpen && (
                  <div className="absolute bottom-full mb-1.5 left-0 z-30 min-w-[70px] bg-white dark:bg-content1 border border-gray-200 dark:border-default-100 rounded-xl shadow-lg py-1 overflow-hidden">
                    {PAGE_OPTIONS.map((size) => {
                      const isSelected = table.getState().pagination.pageSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            table.setPageSize(size);
                            setIsPageSizeOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-150 ${isSelected
                            ? "bg-primary text-white font-medium"
                            : "text-gray-700 dark:text-neutral-300 hover:bg-primary-300 dark:hover:bg-primary hover:text-white"
                            }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden lg:block text-sm text-gray-500 font-semibold">
              Total {typeof totalCount === "number" ? totalCount : data.length} items
            </div>
          </div>

          <nav className="flex items-center gap-2" aria-label="Pagination">
            {showPaginationControls && (
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={clsx(
                  "flex items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                  paginationSize === "sm" && "w-8 h-8",
                  paginationSize === "md" && "w-10 h-10",
                  paginationSize === "lg" && "w-12 h-12",
                  "bg-gray-100 dark:bg-default-100 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-default-200"
                )}
              >
                <FaChevronLeft className="w-5 h-5" aria-hidden />
              </button>
            )}

            <div className="flex items-center gap-1">
              {pages.map((pageNum, idx) => {
                const isActive = pageNum === currentPage;
                const isEllipsis = pageNum === "...";

                if (isEllipsis) {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className={clsx(
                        "flex items-center justify-center text-gray-400",
                        paginationSize === "sm" && "w-8 h-8 text-xs",
                        paginationSize === "md" && "w-10 h-10 text-sm",
                        paginationSize === "lg" && "w-12 h-12 text-base"
                      )}
                    >
                      ...
                    </span>
                  );
                }

                const colorMap = {
                  primary: {
                    solid: "bg-primary text-white shadow-lg shadow-primary/30",
                    bordered: "border-2 border-primary text-primary bg-transparent",
                    flat: "bg-primary/10 text-primary",
                    light: "text-primary hover:bg-primary/10",
                  },
                  secondary: {
                    solid: "bg-secondary text-white shadow-lg shadow-secondary/30",
                    bordered: "border-2 border-secondary text-secondary bg-transparent",
                    flat: "bg-secondary/10 text-secondary",
                    light: "text-secondary hover:bg-secondary/10",
                  },
                  success: {
                    solid: "bg-success text-white shadow-lg shadow-success/30",
                    bordered: "border-2 border-success text-success bg-transparent",
                    flat: "bg-success/10 text-success",
                    light: "text-success hover:bg-success/10",
                  },
                  warning: {
                    solid: "bg-warning text-white shadow-lg shadow-warning/30",
                    bordered: "border-2 border-warning text-warning bg-transparent",
                    flat: "bg-warning/10 text-warning",
                    light: "text-warning hover:bg-warning/10",
                  },
                  danger: {
                    solid: "bg-danger text-white shadow-lg shadow-danger/30",
                    bordered: "border-2 border-danger text-danger bg-transparent",
                    flat: "bg-danger/10 text-danger",
                    light: "text-danger hover:bg-danger/10",
                  },
                  default: {
                    solid: "bg-default-600 text-white shadow-lg shadow-default-600/30",
                    bordered: "border-2 border-default-600 text-default-600 bg-transparent",
                    flat: "bg-default-100 text-default-700",
                    light: "text-default-600 hover:bg-default-50",
                  },
                };

                return (
                  <button
                    key={idx}
                    onClick={() => table.setPageIndex((pageNum as number) - 1)}
                    className={clsx(
                      "flex items-center justify-center font-medium rounded-xl transition-all",
                      paginationSize === "sm" && "w-8 h-8 text-xs",
                      paginationSize === "md" && "w-10 h-10 text-sm",
                      paginationSize === "lg" && "w-12 h-12 text-base",

                      // Active State
                      isActive ? colorMap[paginationColor as keyof typeof colorMap][paginationVariant as keyof (typeof colorMap)['primary']] : [
                        "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-default-100",
                      ]
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {showPaginationControls && (
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={clsx(
                  "flex items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                  paginationSize === "sm" && "w-8 h-8",
                  paginationSize === "md" && "w-10 h-10",
                  paginationSize === "lg" && "w-12 h-12",
                  "bg-gray-100 dark:bg-default-100 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-default-200"
                )}
              >
                <FaChevronRight className="w-5 h-5" aria-hidden />
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

export { TanstackTable };

