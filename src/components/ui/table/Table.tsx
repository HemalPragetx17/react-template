/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type ReactNode, type ReactElement, useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import Checkbox from "../input/Checkbox";
import Spinner from "../spinner/Spinner";

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

  /** Column key that renders the tree hierarchy (indent + chevron) */
  treeColumn?: React.Key;
  /** Controlled expanded row keys */
  expandedKeys?: Selection;
  /** Default expanded row keys (uncontrolled) */
  defaultExpandedKeys?: Selection;
  /** Property on each item that holds nested child rows */
  childrenKey?: string;
  /** Resolve a stable key for each row when flattening the tree */
  getRowKey?: (item: any, index: number) => React.Key;
  /** Renders a full-width panel below a row when it is expanded */
  renderExpandedContent?: (item: any) => React.ReactNode;
  /** Optional footer rendered inside the table */
  footerContent?: React.ReactNode;
  /** Apply standalone 20px rounded corners (for tables without tabs/pagination wrapper) */
  isRounded?: boolean;

  // Events
  onRowAction?: (key: React.Key) => void;
  onCellAction?: (key: React.Key) => void;
  onSelectionChange?: (keys: Selection) => any;
  onSortChange?: (descriptor: SortDescriptor) => any;
  onExpandedChange?: (keys: Selection) => void;
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

type TreeRowMeta = {
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
};

type FlatTreeRow<T> = {
  item: T;
  key: React.Key;
  treeMeta: TreeRowMeta;
};

const TREE_INDENT_PX = 24;
const TREE_CHEVRON_SLOT = "chevron";

const defaultGetRowKey = (item: any, index: number): React.Key =>
  item?.id ?? item?._id ?? index;

const flattenTreeRows = <T,>(
  items: T[],
  getChildren: (item: T) => T[],
  getRowKey: (item: T, index: number) => React.Key,
  expandedKeys: Set<React.Key>,
): FlatTreeRow<T>[] => {
  const result: FlatTreeRow<T>[] = [];

  const walk = (nodes: T[], depth: number) => {
    nodes.forEach((node, index) => {
      const key = getRowKey(node, index);
      const children = getChildren(node) ?? [];
      const hasChildren = Array.isArray(children) && children.length > 0;
      const isExpanded = hasChildren && expandedKeys.has(key);

      result.push({
        item: node,
        key,
        treeMeta: { depth, hasChildren, isExpanded },
      });

      if (isExpanded) {
        walk(children, depth + 1);
      }
    });
  };

  walk(items, 0);
  return result;
};

const isChevronElement = (element: ReactElement): boolean => {
  const props = element.props as Record<string, unknown>;
  return props.slot === TREE_CHEVRON_SLOT || props["data-slot"] === TREE_CHEVRON_SLOT;
};

const containsChevronElement = (node: ReactNode): boolean => {
  if (!React.isValidElement(node)) return false;
  if (isChevronElement(node)) return true;

  const children = (node.props as { children?: ReactNode }).children;
  if (!children) return false;

  let found = false;
  React.Children.forEach(children, (child) => {
    if (!found && containsChevronElement(child)) {
      found = true;
    }
  });
  return found;
};

const wireChevronButtons = (
  node: ReactNode,
  isExpanded: boolean,
  onToggle: () => void,
): ReactNode => {
  if (!React.isValidElement(node)) return node;

  if (isChevronElement(node)) {
    return React.cloneElement(node, {
      onClick: (event: React.MouseEvent) => {
        event.stopPropagation();
        onToggle();
        node.props.onClick?.(event);
      },
      "aria-expanded": isExpanded,
      "aria-label": isExpanded ? "Collapse row" : "Expand row",
    } as Record<string, unknown>);
  }

  const children = (node.props as { children?: ReactNode }).children;
  if (!children) return node;

  const nextChildren = React.Children.map(children, (child) =>
    wireChevronButtons(child, isExpanded, onToggle),
  );

  if (nextChildren !== children) {
    return React.cloneElement(node, {}, nextChildren);
  }

  return node;
};

const renderTreeCellContent = (
  content: ReactNode,
  treeMeta: TreeRowMeta,
  onToggle: () => void,
): ReactNode => {
  const wiredContent = wireChevronButtons(content, treeMeta.isExpanded, onToggle);
  const hasChevron = containsChevronElement(wiredContent);

  return (
    <div
      className="flex min-w-0 items-center gap-1"
      style={{ paddingLeft: treeMeta.depth * TREE_INDENT_PX }}
    >
      {treeMeta.hasChildren && !hasChevron ? (
        <button
          type="button"
          data-slot={TREE_CHEVRON_SLOT}
          aria-expanded={treeMeta.isExpanded}
          aria-label={treeMeta.isExpanded ? "Collapse row" : "Expand row"}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className={clsx(
              "h-3 w-3 transition-transform duration-150",
              treeMeta.isExpanded && "rotate-90",
            )}
          >
            <path
              d="M6 4l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : !treeMeta.hasChildren ? (
        <span className="inline-block w-9 shrink-0" aria-hidden />
      ) : null}
      <div className="min-w-0 flex-1">{wiredContent}</div>
    </div>
  );
};

const TABLE_RADIUS = "rounded-[20px]";
const TABLE_RADIUS_TL = "rounded-tl-[20px]";
const TABLE_RADIUS_TR = "rounded-tr-[20px]";
const TABLE_RADIUS_BL = "rounded-bl-[20px]";
const TABLE_RADIUS_BR = "rounded-br-[20px]";

const enhanceFooterRow = (footerContent: ReactNode, isRounded: boolean): ReactNode => {
  if (!isRounded || !React.isValidElement(footerContent)) return footerContent;

  const rowChildren = (footerContent.props as { children?: ReactNode }).children;
  const cells = React.Children.toArray(rowChildren);
  const lastIndex = cells.length - 1;

  const enhancedCells = cells.map((cell, index) => {
    if (!React.isValidElement(cell)) return cell;

    const cellProps = cell.props as { className?: string };
    return React.cloneElement(cell, {
      className: clsx(
        cellProps.className,
        index === 0 && TABLE_RADIUS_BL,
        index === lastIndex && TABLE_RADIUS_BR,
      ),
    });
  });

  return React.cloneElement(footerContent, {}, enhancedCells);
};

// ─── Main Table Component ─────────────────────────────────────────────────────

export const Table: React.FC<TableProps> = ({
  children,
  color = "primary",
  layout = "auto",
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
  treeColumn,
  expandedKeys,
  defaultExpandedKeys,
  childrenKey = "children",
  getRowKey = defaultGetRowKey,
  renderExpandedContent,
  footerContent,
  isRounded = false,
  onRowAction,
  onCellAction,
  onSelectionChange,
  onSortChange,
  onExpandedChange,
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
  const [expandedKeysState, setExpandedKeysState] = useState<Set<React.Key>>(() => {
    if (expandedKeys !== undefined) {
      const normalized = normalizeSelection(expandedKeys);
      return normalized === "all" ? new Set<React.Key>() : normalized;
    }
    if (defaultExpandedKeys !== undefined) {
      const normalized = normalizeSelection(defaultExpandedKeys);
      return normalized === "all" ? new Set<React.Key>() : normalized;
    }
    return new Set<React.Key>();
  });

  useEffect(() => {
    if (expandedKeys !== undefined) {
      const normalized = normalizeSelection(expandedKeys);
      setExpandedKeysState(normalized === "all" ? new Set<React.Key>() : normalized);
    }
  }, [expandedKeys]);

  const activeExpandedKeys = useMemo(() => {
    if (expandedKeys !== undefined) {
      const normalized = normalizeSelection(expandedKeys);
      return normalized === "all" ? new Set<React.Key>() : normalized;
    }
    return expandedKeysState;
  }, [expandedKeys, expandedKeysState]);

  const toggleExpanded = (rowKey: React.Key) => {
    const nextExpanded = new Set(activeExpandedKeys);
    if (nextExpanded.has(rowKey)) {
      nextExpanded.delete(rowKey);
    } else {
      nextExpanded.add(rowKey);
    }

    if (expandedKeys === undefined) {
      setExpandedKeysState(nextExpanded);
    }
    onExpandedChange?.(nextExpanded);
  };

  const rows = useMemo(() => {
    const list: Array<{
      key: React.Key;
      item?: any;
      props: TableRowProps;
      cells: Array<{ key: React.Key; props: TableCellProps }>;
      treeMeta?: TreeRowMeta;
    }> = [];
    if (!bodyElement) return list;

    const { items: bodyItems, children: bodyChildren } = bodyElement.props;
    const useTreeFlattening = treeColumn !== undefined && !renderExpandedContent;

    if (bodyItems && typeof bodyChildren === "function") {
      const itemsArray = Array.from(bodyItems);

      if (useTreeFlattening) {
        const flatRows = flattenTreeRows(
          itemsArray,
          (item) => (item as Record<string, unknown>)[childrenKey] as any[] ?? [],
          getRowKey,
          activeExpandedKeys,
        );

        flatRows.forEach(({ item, key, treeMeta }) => {
          const rowEl = bodyChildren(item);
          if (React.isValidElement(rowEl)) {
            const cells = extractCellsForRow(rowEl, columns);
            list.push({
              key,
              item,
              props: rowEl.props as TableRowProps,
              cells,
              treeMeta,
            });
          }
        });
      } else {
        itemsArray.forEach((item, rowIndex) => {
          const rowEl = bodyChildren(item);
          if (React.isValidElement(rowEl)) {
            const rowKey = rowEl.key !== null ? rowEl.key : getRowKey(item, rowIndex);
            const cells = extractCellsForRow(rowEl, columns);
            list.push({
              key: rowKey,
              item,
              props: rowEl.props as TableRowProps,
              cells,
            });
          }
        });
      }
    } else if (typeof bodyChildren !== "function") {
      const flatRows = flattenChildren(bodyChildren);
      flatRows.forEach((rowEl, rowIndex) => {
        if (React.isValidElement(rowEl) && (rowEl.type as any).displayName === "TableRow") {
          const rowKey = rowEl.key !== null ? rowEl.key : String(rowIndex);
          const cells = extractCellsForRow(rowEl as ReactElement<TableRowProps>, columns);
          list.push({
            key: rowKey,
            props: rowEl.props as TableRowProps,
            cells,
          });
        }
      });
    }
    return list;
  }, [bodyElement, columns, treeColumn, childrenKey, getRowKey, activeExpandedKeys, renderExpandedContent]);

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
      "relative flex flex-col justify-between bg-white dark:bg-neutral-900 dark:border-neutral-800",
      isRounded && "border border-gray-100 overflow-hidden",
      !isRounded && "overflow-auto",
      isRounded && TABLE_RADIUS,
      shadowClasses[shadow],
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
      "bg-white dark:bg-neutral-800/40 border-b border-gray-100 dark:border-neutral-800",
      classNames.thead
    ),
    tbody: clsx(classNames.tbody),
    tr: (isSelected: boolean, isDisabled: boolean, hasFooter = false) =>
      clsx(
        "group relative outline-none transition-colors duration-200 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800/30",
        !hasFooter && "last:border-b-0",
        isSelected && colorSelectionClasses[color],
        !isSelected && "hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30",
        !isSelected && isStriped && "even:bg-neutral-50 dark:even:bg-neutral-800/20",
        isDisabled && "opacity-50 cursor-not-allowed select-none",
        !isDisabled && "cursor-default",
        classNames.tr
      ),
    th: (align: "start" | "center" | "end" = "start", allowsSorting = false) =>
      clsx(
        "px-5 py-4 font-semibold text-sm text-gray-700 dark:text-gray-300 normal-case tracking-normal select-none align-middle transition-colors duration-200",
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
        "px-5 py-4 text-sm font-semibold align-middle relative transition-colors duration-200 text-neutral-900 dark:text-neutral-200",
        align === "center" && "text-center",
        align === "end" && "text-right",
        align === "start" && "text-left",
        isCompact && "py-2.5 px-4",
        isSelected && "font-medium",
        classNames.td
      ),
    tfoot: clsx("bg-white dark:bg-neutral-900", classNames.tfoot),
    sortIcon: clsx("inline-flex shrink-0 w-4 h-4 items-center justify-center transition-transform duration-200", classNames.sortIcon),
    emptyWrapper: clsx(
      "flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 py-12 w-full text-center border-t border-gray-100 dark:border-neutral-800",
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
              <th
                className={clsx(slots.th("center", false), isRounded && TABLE_RADIUS_TL)}
                style={{ width: "48px" }}
              >
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
            {columns.map((col, colIndex) => {
              const isColSorted = sortDescriptor?.column === col.key;
              const sortDirection = isColSorted ? sortDescriptor?.direction : undefined;
              const style: React.CSSProperties = {};
              if (col.props.width !== undefined) style.width = col.props.width;
              if (col.props.minWidth !== undefined) style.minWidth = col.props.minWidth;
              if (col.props.maxWidth !== undefined) style.maxWidth = col.props.maxWidth;
              const isFirstColumn = !showSelectionColumn && colIndex === 0;
              const isLastColumn = colIndex === columns.length - 1;

              return (
                <th
                  key={col.key}
                  onClick={() => col.props.allowsSorting && handleSort(col.key)}
                  className={clsx(
                    slots.th(col.props.align, col.props.allowsSorting),
                    col.props.className,
                    isFirstColumn && isRounded && TABLE_RADIUS_TL,
                    isLastColumn && isRounded && TABLE_RADIUS_TR,
                  )}
                  style={{ ...style, ...col.props.style }}
                >
                  <div
                    className={clsx(
                      col.props.allowsSorting
                        ? "flex w-full items-center justify-between gap-2"
                        : "inline-flex items-center gap-1",
                    )}
                  >
                    {col.props.hideHeader ? null : (
                      <span
                        className={clsx(
                          "min-w-0",
                          col.props.align === "center" && col.props.allowsSorting && "flex-1 text-center",
                          col.props.align === "end" && col.props.allowsSorting && "flex-1 text-right",
                        )}
                      >
                        {col.props.children}
                      </span>
                    )}
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
              <div className="flex min-h-[160px] w-full items-center justify-center py-12">
                {loadingContent || <Spinner color={color === "default" ? "primary" : color} size="md" />}
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
          rows.flatMap((row, rowIndex) => {
            const isSelected = isRowSelected(row.key);
            const isDisabled = disabledKeysSet.has(row.key);
            const isLastRow = isRounded && !footerContent && rowIndex === rows.length - 1;
            const rowStyle: React.CSSProperties = {};
            if (rowHeight !== undefined) {
              rowStyle.height = typeof rowHeight === "number" ? `${rowHeight}px` : rowHeight;
            }

            const mainRow = (
              <tr
                key={row.key}
                style={rowStyle}
                onClick={(e) => handleRowClick(e, row.key)}
                className={slots.tr(isSelected, isDisabled, Boolean(footerContent))}
              >
                {showSelectionColumn && (
                  <td
                    className={clsx(
                      slots.td("center", isSelected),
                      isLastRow && TABLE_RADIUS_BL,
                    )}
                    style={{ width: "48px" }}
                  >
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

                {row.cells.map((cell, cellIndex) => {
                  const col = columns[cellIndex];
                  const align = col ? col.props.align : "start";
                  const isTreeColumn = treeColumn !== undefined && col?.key === treeColumn;
                  const isFirstCell = cellIndex === 0;
                  const isLastCell = cellIndex === row.cells.length - 1;
                  const cellContent =
                    isTreeColumn && row.treeMeta
                      ? renderTreeCellContent(
                          cell.props.children,
                          row.treeMeta,
                          () => toggleExpanded(row.key),
                        )
                      : cell.props.children;

                  return (
                    <td
                      key={cell.key}
                      onClick={() => onCellAction?.(cell.key)}
                      className={clsx(
                        slots.td(align, isSelected),
                        cell.props.className,
                        isLastRow && isFirstCell && !showSelectionColumn && TABLE_RADIUS_BL,
                        isLastRow && isLastCell && TABLE_RADIUS_BR,
                      )}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            );

            const isExpanded = activeExpandedKeys.has(row.key);
            if (!renderExpandedContent || !isExpanded || row.item === undefined) {
              return [mainRow];
            }

            return [
              mainRow,
              <tr key={`${String(row.key)}-expanded`} className="bg-neutral-50/40 dark:bg-neutral-800/20">
                <td colSpan={totalColumnsCount} className="border-b border-gray-100 p-0 dark:border-neutral-800/30">
                  {renderExpandedContent(row.item)}
                </td>
              </tr>,
            ];
          })
        )}
      </tbody>
      {footerContent && (
        <tfoot className={slots.tfoot}>{enhanceFooterRow(footerContent, isRounded)}</tfoot>
      )}
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
