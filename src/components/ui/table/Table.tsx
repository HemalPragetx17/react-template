/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type ReactNode, type ReactElement, useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import Checkbox from "../input/Checkbox";
import Spinner from "../spinner/Spinner";
import { getRadiusClass } from "../shared/radius";

// ─── Table Types ─────────────────────────────────────────────────────────────

export type SortDescriptor = {
  column: React.Key;
  direction: "ascending" | "descending";
};

export type Selection = "all" | Set<React.Key> | React.Key[];

export type LoadingState = "loading" | "sorting" | "loadingMore" | "error" | "idle" | "filtering";

// ─── Component Props ─────────────────────────────────────────────────────────

export interface TableColumnProps {
  children?: ReactNode;
  align?: "start" | "center" | "end";
  hideHeader?: boolean;
  allowsSorting?: boolean;
  sortIcon?: ReactNode;
  isRowHeader?: boolean;
  textValue?: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export interface TableHeaderProps<T> {
  children?: ReactNode | ((column: T) => ReactElement<TableColumnProps>);
  columns?: T[];
}

export interface TableCellProps {
  children?: ReactNode;
  textValue?: string;
  className?: string;
}

export interface TableRowProps {
  children?: ReactNode | ReactNode[] | ((columnKey: React.Key) => ReactElement<TableCellProps>);
  textValue?: string;
}

export interface TableBodyProps<T> {
  children?: ReactNode | ReactNode[] | ((item: T) => ReactElement<TableRowProps>);
  items?: Iterable<T>;
  isLoading?: boolean;
  loadingState?: LoadingState;
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
  onLoadMore?: () => any;
}

export interface TableProps {
  children?: ReactNode | ReactNode[];
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  layout?: "auto" | "fixed";
  radius?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  maxTableHeight?: number | string;
  rowHeight?: number | string;
  isVirtualized?: boolean;
  hideHeader?: boolean;
  isStriped?: boolean;
  isCompact?: boolean;
  isHeaderSticky?: boolean;
  fullWidth?: boolean;
  removeWrapper?: boolean;
  BaseComponent?: React.ComponentType<any> | string;
  topContent?: ReactNode;
  bottomContent?: ReactNode;
  topContentPlacement?: "inside" | "outside";
  bottomContentPlacement?: "inside" | "outside";
  showSelectionCheckboxes?: boolean;
  sortDescriptor?: SortDescriptor;
  selectedKeys?: Selection;
  defaultSelectedKeys?: Selection;
  disabledKeys?: Selection;
  disallowEmptySelection?: boolean;
  selectionMode?: "single" | "multiple" | "none";
  selectionBehavior?: "toggle" | "replace";
  disabledBehavior?: "selection" | "all";
  allowDuplicateSelectionEvents?: boolean;
  disableAnimation?: boolean;
  checkboxesProps?: any;
  classNames?: Partial<Record<
    | "base"
    | "table"
    | "thead"
    | "tbody"
    | "tfoot"
    | "emptyWrapper"
    | "loadingWrapper"
    | "wrapper"
    | "tr"
    | "th"
    | "td"
    | "sortIcon",
    string
  >>;
  isKeyboardNavigationDisabled?: boolean;

  // Events
  onRowAction?: (key: React.Key) => void;
  onCellAction?: (key: React.Key) => void;
  onSelectionChange?: (keys: Selection) => any;
  onSortChange?: (descriptor: SortDescriptor) => any;
}

// ─── Sub-Component Placeholders ──────────────────────────────────────────────

export const TableHeader = <T,>(_props: TableHeaderProps<T>) => {
  return null;
};
TableHeader.displayName = "TableHeader";

export const TableColumn: React.FC<TableColumnProps> = (_props) => {
  return null;
};
TableColumn.displayName = "TableColumn";

export const TableBody = <T,>(_props: TableBodyProps<T>) => {
  return null;
};
TableBody.displayName = "TableBody";

export const TableRow: React.FC<TableRowProps> = (_props) => {
  return null;
};
TableRow.displayName = "TableRow";

export const TableCell: React.FC<TableCellProps> = (_props) => {
  return null;
};
TableCell.displayName = "TableCell";

// ─── Helper Functions ────────────────────────────────────────────────────────

const flattenChildren = (nodes: ReactNode): ReactNode[] => {
  const result: ReactNode[] = [];
  React.Children.forEach(nodes, (node) => {
    if (React.isValidElement(node) && node.type === React.Fragment) {
      result.push(...flattenChildren(node.props.children));
    } else if (node !== null && node !== undefined) {
      result.push(node);
    }
  });
  return result;
};

const normalizeSelection = (sel: Selection | undefined): Set<React.Key> | "all" => {
  if (sel === "all") return "all";
  if (sel instanceof Set) return sel;
  if (Array.isArray(sel)) return new Set(sel);
  return new Set<React.Key>();
};

// ─── Main Table Component ─────────────────────────────────────────────────────

export const Table: React.FC<TableProps> = ({
  children,
  color = "primary",
  layout = "auto",
  radius = "lg",
  shadow = "sm",
  maxTableHeight,
  rowHeight,
  hideHeader = false,
  isStriped = false,
  isCompact = false,
  isHeaderSticky = false,
  fullWidth = true,
  removeWrapper = false,
  BaseComponent = "div",
  topContent,
  bottomContent,
  topContentPlacement = "inside",
  bottomContentPlacement = "inside",
  showSelectionCheckboxes,
  sortDescriptor,
  selectedKeys,
  defaultSelectedKeys,
  disabledKeys,
  disallowEmptySelection = false,
  selectionMode = "none",
  selectionBehavior = "toggle",
  disabledBehavior = "selection",
  checkboxesProps = {},
  classNames = {},
  onRowAction,
  onCellAction,
  onSelectionChange,
  onSortChange,
}) => {
  // ─── Collection Parser ─────────────────────────────────────────────────────

  const flatChildren = useMemo(() => flattenChildren(children), [children]);

  const headerElement = useMemo(() => {
    return flatChildren.find(
      (child) => React.isValidElement(child) && (child.type as any).displayName === "TableHeader"
    ) as ReactElement<TableHeaderProps<any>> | undefined;
  }, [flatChildren]);

  const bodyElement = useMemo(() => {
    return flatChildren.find(
      (child) => React.isValidElement(child) && (child.type as any).displayName === "TableBody"
    ) as ReactElement<TableBodyProps<any>> | undefined;
  }, [flatChildren]);

  // Extract columns
  const columns = useMemo(() => {
    const list: Array<{ key: React.Key; props: TableColumnProps }> = [];
    if (!headerElement) return list;

    const { columns: colItems, children: colChildren } = headerElement.props;

    if (colItems && typeof colChildren === "function") {
      colItems.forEach((col, index) => {
        const colEl = colChildren(col);
        if (React.isValidElement(colEl)) {
          const colKey = colEl.key !== null ? colEl.key : String(index);
          list.push({
            key: colKey,
            props: colEl.props as TableColumnProps,
          });
        }
      });
    } else if (typeof colChildren !== "function") {
      const flatCols = flattenChildren(colChildren);
      flatCols.forEach((colEl, index) => {
        if (React.isValidElement(colEl) && (colEl.type as any).displayName === "TableColumn") {
          const colKey = colEl.key !== null ? colEl.key : String(index);
          list.push({
            key: colKey,
            props: colEl.props as TableColumnProps,
          });
        }
      });
    }
    return list;
  }, [headerElement]);

  // Extract cells for a specific row
  const extractCellsForRow = (
    rowEl: ReactElement<TableRowProps>,
    columnsList: Array<{ key: React.Key; props: TableColumnProps }>
  ) => {
    const { children: cellChildren } = rowEl.props;
    const list: Array<{ key: React.Key; props: TableCellProps }> = [];

    if (typeof cellChildren === "function") {
      columnsList.forEach((col, colIndex) => {
        const cellEl = cellChildren(col.key);
        if (React.isValidElement(cellEl)) {
          const cellKey = cellEl.key !== null ? cellEl.key : `${col.key}-${colIndex}`;
          list.push({
            key: cellKey,
            props: cellEl.props as TableCellProps,
          });
        }
      });
    } else {
      const flatCells = flattenChildren(cellChildren);
      flatCells.forEach((cellEl, cellIndex) => {
        if (React.isValidElement(cellEl) && (cellEl.type as any).displayName === "TableCell") {
          const cellKey = cellEl.key !== null ? cellEl.key : String(cellIndex);
          list.push({
            key: cellKey,
            props: cellEl.props as TableCellProps,
          });
        }
      });
    }
    return list;
  };

  // Extract rows
  const rows = useMemo(() => {
    const list: Array<{ key: React.Key; props: TableRowProps; cells: Array<{ key: React.Key; props: TableCellProps }> }> = [];
    if (!bodyElement) return list;

    const { items: bodyItems, children: bodyChildren } = bodyElement.props;

    if (bodyItems && typeof bodyChildren === "function") {
      const itemsArray = Array.from(bodyItems);
      itemsArray.forEach((item, rowIndex) => {
        const rowEl = bodyChildren(item);
        if (React.isValidElement(rowEl)) {
          const rowKey = rowEl.key !== null ? rowEl.key : String(rowIndex);
          const cells = extractCellsForRow(rowEl, columns);
          list.push({
            key: rowKey,
            props: rowEl.props as TableRowProps,
            cells,
          });
        }
      });
    } else if (typeof bodyChildren !== "function") {
      const flatRows = flattenChildren(bodyChildren);
      flatRows.forEach((rowEl, rowIndex) => {
        if (React.isValidElement(rowEl) && (rowEl.type as any).displayName === "TableRow") {
          const rowKey = rowEl.key !== null ? rowEl.key : String(rowIndex);
          const cells = extractCellsForRow(rowEl, columns);
          list.push({
            key: rowKey,
            props: rowEl.props as TableRowProps,
            cells,
          });
        }
      });
    }
    return list;
  }, [bodyElement, columns]);

  // ─── Selection State Management ──────────────────────────────────────────────

  const [selectedKeysState, setSelectedKeysState] = useState<Set<React.Key> | "all">(() => {
    if (selectedKeys !== undefined) return normalizeSelection(selectedKeys);
    if (defaultSelectedKeys !== undefined) return normalizeSelection(defaultSelectedKeys);
    return new Set<React.Key>();
  });

  useEffect(() => {
    if (selectedKeys !== undefined) {
      setSelectedKeysState(normalizeSelection(selectedKeys));
    }
  }, [selectedKeys]);

  const disabledKeysSet = useMemo(() => {
    const norm = normalizeSelection(disabledKeys);
    if (norm === "all") {
      return new Set<React.Key>(rows.map((r) => r.key));
    }
    return norm;
  }, [disabledKeys, rows]);

  const allSelectableRowKeys = useMemo(() => {
    return rows.map((r) => r.key).filter((key) => !disabledKeysSet.has(key));
  }, [rows, disabledKeysSet]);

  const isRowSelected = (rowKey: React.Key) => {
    if (selectionMode === "none") return false;
    if (selectedKeysState === "all") {
      return !disabledKeysSet.has(rowKey);
    }
    return selectedKeysState.has(rowKey);
  };

  const toggleRowSelection = (rowKey: React.Key) => {
    if (selectionMode === "none") return;
    if (disabledKeysSet.has(rowKey)) return;

    let nextSelected: Set<React.Key> | "all";
    if (selectionMode === "single") {
      const isSelected = isRowSelected(rowKey);
      if (isSelected) {
        if (disallowEmptySelection) return;
        nextSelected = new Set<React.Key>();
      } else {
        nextSelected = new Set<React.Key>([rowKey]);
      }
    } else {
      // Multiple
      const currentSet = new Set<React.Key>();
      if (selectedKeysState === "all") {
        allSelectableRowKeys.forEach((k) => currentSet.add(k));
      } else {
        selectedKeysState.forEach((k) => currentSet.add(k));
      }

      if (currentSet.has(rowKey)) {
        currentSet.delete(rowKey);
        if (disallowEmptySelection && currentSet.size === 0) return;
        nextSelected = currentSet;
      } else {
        currentSet.add(rowKey);
        if (currentSet.size === allSelectableRowKeys.length) {
          nextSelected = "all";
        } else {
          nextSelected = currentSet;
        }
      }
    }

    if (selectedKeys === undefined) {
      setSelectedKeysState(nextSelected);
    }
    onSelectionChange?.(nextSelected);
  };

  const toggleSelectAll = () => {
    if (selectionMode !== "multiple") return;

    const selectableKeys = allSelectableRowKeys;
    const allAreSelected = selectedKeysState === "all" || selectableKeys.every((k) => isRowSelected(k));

    let nextSelected: Set<React.Key> | "all";
    if (allAreSelected) {
      if (disallowEmptySelection) return;
      nextSelected = new Set<React.Key>();
    } else {
      nextSelected = "all";
    }

    if (selectedKeys === undefined) {
      setSelectedKeysState(nextSelected);
    }
    onSelectionChange?.(nextSelected);
  };

  // ─── Interaction Handlers ───────────────────────────────────────────────────

  const handleRowClick = (e: React.MouseEvent, rowKey: React.Key) => {
    const target = e.target as HTMLElement;
    // Prevent selection toggles if clicking interactives
    if (target.closest("button, input, select, textarea, a") || target.closest(".select-checkbox")) {
      return;
    }

    const isDisabled = disabledKeysSet.has(rowKey);
    if (isDisabled && disabledBehavior === "all") {
      return;
    }

    onRowAction?.(rowKey);

    if (selectionMode !== "none" && !isDisabled && selectionBehavior === "toggle") {
      toggleRowSelection(rowKey);
    } else if (selectionMode !== "none" && !isDisabled && selectionBehavior === "replace") {
      const nextSelected = new Set<React.Key>([rowKey]);
      if (selectedKeys === undefined) {
        setSelectedKeysState(nextSelected);
      }
      onSelectionChange?.(nextSelected);
    }
  };

  const handleSort = (columnKey: React.Key) => {
    if (!onSortChange) return;

    let nextDirection: "ascending" | "descending" = "ascending";
    if (sortDescriptor && sortDescriptor.column === columnKey) {
      nextDirection = sortDescriptor.direction === "ascending" ? "descending" : "ascending";
    }

    onSortChange({
      column: columnKey,
      direction: nextDirection,
    });
  };

  // ─── Styles & Slot Classes ──────────────────────────────────────────────────

  const shadowClasses = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const colorSelectionClasses = {
    default: "bg-neutral-100/70 dark:bg-neutral-800/80 text-neutral-900 dark:text-white font-medium",
    primary: "bg-primary-50/70 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 font-medium",
    secondary: "bg-secondary-50/70 dark:bg-secondary-950/20 text-secondary-700 dark:text-secondary-400 font-medium",
    success: "bg-success-50/70 dark:bg-success-950/20 text-success-700 dark:text-success-400 font-medium",
    warning: "bg-warning-50/70 dark:bg-warning-950/20 text-warning-700 dark:text-warning-400 font-medium",
    danger: "bg-danger-50/70 dark:bg-danger-950/20 text-danger-700 dark:text-danger-400 font-medium",
  };

  const showSelectionColumn = selectionMode !== "none" && showSelectionCheckboxes !== false;

  const isAllSelected = useMemo(() => {
    if (selectionMode !== "multiple") return false;
    if (allSelectableRowKeys.length === 0) return false;
    if (selectedKeysState === "all") return true;
    return allSelectableRowKeys.every((key) => selectedKeysState.has(key));
  }, [selectedKeysState, allSelectableRowKeys, selectionMode]);

  const isSomeSelected = useMemo(() => {
    if (selectionMode !== "multiple") return false;
    if (selectedKeysState === "all") return false;
    return selectedKeysState.size > 0 && selectedKeysState.size < allSelectableRowKeys.length;
  }, [selectedKeysState, allSelectableRowKeys, selectionMode]);

  const totalColumnsCount = columns.length + (showSelectionColumn ? 1 : 0);

  const slots = {
    base: clsx("flex flex-col relative w-full gap-4", classNames.base),
    wrapper: clsx(
      "relative flex flex-col justify-between overflow-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
      shadowClasses[shadow],
      getRadiusClass(radius),
      !removeWrapper && "p-4",
      classNames.wrapper
    ),
    table: clsx(
      "min-w-full h-auto border-collapse",
      layout === "fixed" ? "table-fixed" : "table-auto",
      fullWidth ? "w-full" : "w-auto",
      classNames.table
    ),
    thead: clsx(
      "bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800",
      classNames.thead
    ),
    tbody: clsx("divide-y divide-neutral-100 dark:divide-neutral-800/30", classNames.tbody),
    tr: (isSelected: boolean, isDisabled: boolean) =>
      clsx(
        "group relative outline-none transition-colors duration-200",
        isSelected && colorSelectionClasses[color],
        !isSelected && "hover:bg-neutral-50 dark:hover:bg-neutral-800/30",
        !isSelected && isStriped && "even:bg-neutral-50 dark:even:bg-neutral-800/20",
        isDisabled && "opacity-50 cursor-not-allowed select-none",
        !isDisabled && "cursor-default",
        classNames.tr
      ),
    th: (align: "start" | "center" | "end" = "start", allowsSorting = false) =>
      clsx(
        "px-4 py-3 font-semibold text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider select-none align-middle transition-colors duration-200",
        isHeaderSticky &&
          "sticky top-0 z-20 bg-neutral-50 dark:bg-neutral-900 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.1)]",
        align === "center" && "text-center",
        align === "end" && "text-right",
        align === "start" && "text-left",
        allowsSorting && "cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200",
        classNames.th
      ),
    td: (align: "start" | "center" | "end" = "start", isSelected = false) =>
      clsx(
        "px-4 py-3 text-sm align-middle relative transition-colors duration-200 text-neutral-800 dark:text-neutral-200",
        align === "center" && "text-center",
        align === "end" && "text-right",
        align === "start" && "text-left",
        isCompact ? "py-1.5 px-3" : "py-3 px-4",
        isSelected && "font-medium",
        classNames.td
      ),
    tfoot: clsx(classNames.tfoot),
    sortIcon: clsx("inline-block ml-1.5 w-3.5 h-3.5 transition-transform duration-200 align-middle", classNames.sortIcon),
    emptyWrapper: clsx(
      "flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 py-12 w-full text-center border-t border-neutral-100 dark:border-neutral-800",
      classNames.emptyWrapper
    ),
    loadingWrapper: clsx(
      "absolute inset-0 bg-white/70 dark:bg-neutral-900/70 flex items-center justify-center z-30 transition-opacity duration-300",
      classNames.loadingWrapper
    ),
  };

  const isLoading = bodyElement?.props.isLoading;
  const loadingContent = bodyElement?.props.loadingContent;
  const emptyContent = bodyElement?.props.emptyContent;

  // ─── Renders ───────────────────────────────────────────────────────────────

  const TableContent = (
    <table className={slots.table}>
      {!hideHeader && headerElement && (
        <thead className={slots.thead}>
          <tr>
            {/* Selection Column Header */}
            {showSelectionColumn && (
              <th className={slots.th("center", false)} style={{ width: "48px" }}>
                {selectionMode === "multiple" && (
                  <div className="flex items-center justify-center select-checkbox">
                    <Checkbox
                      color={color}
                      isIndeterminate={isSomeSelected}
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      {...checkboxesProps}
                    />
                  </div>
                )}
              </th>
            )}

            {/* Main Column Headers */}
            {columns.map((col) => {
              const isColSorted = sortDescriptor?.column === col.key;
              const sortDirection = isColSorted ? sortDescriptor?.direction : undefined;
              const style: React.CSSProperties = {};
              if (col.props.width !== undefined) style.width = col.props.width;
              if (col.props.minWidth !== undefined) style.minWidth = col.props.minWidth;
              if (col.props.maxWidth !== undefined) style.maxWidth = col.props.maxWidth;

              return (
                <th
                  key={col.key}
                  onClick={() => col.props.allowsSorting && handleSort(col.key)}
                  className={clsx(slots.th(col.props.align, col.props.allowsSorting), col.props.className)}
                  style={{ ...style, ...col.props.style }}
                >
                  <div className="inline-flex items-center gap-1 group">
                    {col.props.hideHeader ? null : col.props.children}
                    {col.props.allowsSorting && (
                      <span className={slots.sortIcon}>
                        {col.props.sortIcon ? (
                          col.props.sortIcon
                        ) : isColSorted ? (
                          sortDirection === "ascending" ? (
                            <FaChevronUp className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
                          ) : (
                            <FaChevronDown className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
                          )
                        ) : (
                          <FaChevronUp className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
      )}

      <tbody className={slots.tbody}>
        {isLoading && rows.length === 0 ? (
          <tr className="border-none">
            <td colSpan={totalColumnsCount} className="p-0 border-none">
              <div className="relative min-h-[160px] w-full">
                <div className={slots.loadingWrapper}>
                  {loadingContent || <Spinner color={color === "default" ? "primary" : color} size="md" />}
                </div>
              </div>
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr className="border-none">
            <td colSpan={totalColumnsCount} className="p-0 border-none">
              <div className={slots.emptyWrapper}>{emptyContent || "No rows to display."}</div>
            </td>
          </tr>
        ) : (
          rows.map((row) => {
            const isSelected = isRowSelected(row.key);
            const isDisabled = disabledKeysSet.has(row.key);
            const rowStyle: React.CSSProperties = {};
            if (rowHeight !== undefined) {
              rowStyle.height = typeof rowHeight === "number" ? `${rowHeight}px` : rowHeight;
            }

            return (
              <tr
                key={row.key}
                style={rowStyle}
                onClick={(e) => handleRowClick(e, row.key)}
                className={slots.tr(isSelected, isDisabled)}
              >
                {/* Selection Checkbox Cell */}
                {showSelectionColumn && (
                  <td className={slots.td("center", isSelected)} style={{ width: "48px" }}>
                    <div className="flex items-center justify-center select-checkbox">
                      <Checkbox
                        color={color}
                        checked={isSelected}
                        disabled={isDisabled && disabledBehavior === "selection"}
                        onChange={() => toggleRowSelection(row.key)}
                        {...checkboxesProps}
                      />
                    </div>
                  </td>
                )}

                {/* Main Data Cells */}
                {row.cells.map((cell, cellIndex) => {
                  const col = columns[cellIndex];
                  const align = col ? col.props.align : "start";
                  return (
                    <td
                      key={cell.key}
                      onClick={() => onCellAction?.(cell.key)}
                      className={clsx(slots.td(align, isSelected), cell.props.className)}
                    >
                      {cell.props.children}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  const Component = BaseComponent as any;

  const wrapperStyle: React.CSSProperties = {};
  if (maxTableHeight !== undefined && !removeWrapper) {
    wrapperStyle.maxHeight = typeof maxTableHeight === "number" ? `${maxTableHeight}px` : maxTableHeight;
  }

  // Placements Outside
  const renderTopOutside = topContent && topContentPlacement === "outside";
  const renderTopInside = topContent && topContentPlacement === "inside";
  const renderBottomOutside = bottomContent && bottomContentPlacement === "outside";
  const renderBottomInside = bottomContent && bottomContentPlacement === "inside";

  return (
    <Component className={slots.base}>
      {renderTopOutside && topContent}

      {removeWrapper ? (
        <div className="relative w-full">
          {TableContent}
          {isLoading && rows.length > 0 && (
            <div className={slots.loadingWrapper}>
              {loadingContent || <Spinner color={color === "default" ? "primary" : color} size="md" />}
            </div>
          )}
        </div>
      ) : (
        <div className={slots.wrapper} style={wrapperStyle}>
          {renderTopInside && topContent}
          <div className="relative w-full overflow-auto">
            {TableContent}
            {isLoading && rows.length > 0 && (
              <div className={slots.loadingWrapper}>
                {loadingContent || <Spinner color={color === "default" ? "primary" : color} size="md" />}
              </div>
            )}
          </div>
          {renderBottomInside && bottomContent}
        </div>
      )}

      {renderBottomOutside && bottomContent}
    </Component>
  );
};

Table.displayName = "Table";
