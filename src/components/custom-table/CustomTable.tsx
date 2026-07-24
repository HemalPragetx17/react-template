/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

// ── React Icons ───────────────────────────────────────────────────────────────
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { CgRadioChecked } from "react-icons/cg";
import { FiBell, FiChevronDown } from "react-icons/fi";
import { PiInfoBold } from "react-icons/pi";

// ── UI Components (from our own component library) ────────────────────────────
import type { Selection, SortDescriptor } from "../../components/ui";
import {
    Avatar,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Rating,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
} from "../../components/ui";
import TableFooter from "./TableFooter";

// ── Models & Enums ────────────────────────────────────────────────────────────
import type { IColumn } from "../../models/base-type";
import {
    ProviderStatus,
    ProviderStatusColor,
    type ProviderStatusValue,
} from "../../shared/enums/status";
import { PageActions } from "../../shared/enums/table-page-actions";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const statusColorMap: Record<string, "success" | "warning" | "danger" | "default"> = {
    verified: "success",
    success: "success",
    pending: "warning",
    declined: "warning",
    blocked: "warning",
    paid: "success",
    failed: "danger",
    cancelled: "danger",
};

/** Inline page-detail change handler (replaces the commented-out one in commonFunctions.ts) */
function handlePageDetailChange(
    action: string,
    value: number,
    pageDetails: { page: number; limit: number }
): { page: number; limit: number } {
    switch (action) {
        case PageActions.PageChange:
            return { ...pageDetails, page: value };
        case PageActions.RowsPerPageChange:
            return { ...pageDetails, page: 1, limit: value };
        default:
            return pageDetails;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline User component (replaces @heroui/react User)
// ─────────────────────────────────────────────────────────────────────────────

interface UserCellProps {
    name: string;
    description?: React.ReactNode;
    avatarProps?: { src?: string; radius?: "none" | "sm" | "md" | "lg" | "full" };
    className?: string;
}

const UserCell: React.FC<UserCellProps> = ({ name, description, avatarProps, className }) => (
    <div className={["flex items-center gap-3", className].filter(Boolean).join(" ")}>
        <Avatar
            src={avatarProps?.src}
            radius={avatarProps?.radius ?? "lg"}
            size="sm"
            name={name}
        />
        <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-tight">
                {name}
            </span>
            {description && (
                <span className="text-xs text-neutral-500 leading-tight">{description}</span>
            )}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Action Menu Item
// ─────────────────────────────────────────────────────────────────────────────

export interface IActionMenuItem {
    /** Label shown in the dropdown */
    label: string;
    /** Handler receives the full row object */
    onClick: (row: any) => void;
    /** Optional HeroUI chip/item color — defaults to normal text */
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

// ─────────────────────────────────────────────────────────────────────────────
// CustomTable Props
// ─────────────────────────────────────────────────────────────────────────────

interface CustomTableProps {
    columns: IColumn[];
    data: any[];
    /** Striped table */
    isStriped?: boolean;
    /** Selection mode */
    selectionMode?: "none" | "single" | "multiple";
    /** Selection behaviour — toggle (default) or replace */
    selectionBehavior?: "toggle" | "replace";
    /** Show checkbox column when selection is active */
    showSelectionCheckboxes?: boolean;
    /** Controlled selected keys */
    selectedKeys?: Selection;
    /** Default selected keys (uncontrolled) */
    defaultSelectedKeys?: Selection;
    /** Keys that cannot be selected */
    disabledKeys?: Selection;
    /** Called whenever selection changes */
    onSelectionChange?: (keys: Selection) => void;
    /** Called when a row is clicked/activated */
    onRowAction?: (key: React.Key) => void;
    /** Show active/deactive toggle in actions */
    ActiveDeActiveSwitch?: boolean;
    /** Show info icon in actions */
    Info?: boolean;
    /** Show send-notification icon in actions */
    Send?: boolean;
    /** Show edit icon in actions */
    Edit?: boolean;
    /** Show delete icon in actions */
    Delete?: boolean;
    /** Show view icon in actions */
    View?: boolean;
    /**
     * Extra dropdown menu items shown as a ⋮ three-dot button in the actions column.
     * Each item has a label, a color, and an onClick handler that receives the row.
     * Example:
     * actionMenu={[
     *   { label: 'Edit User',    onClick: (row) => handleEdit(row) },
     *   { label: 'Assign Hours', onClick: (row) => handleAssign(row) },
     *   { label: 'Delete User',  onClick: (row) => handleDelete(row._id), color: 'danger' },
     * ]}
     */
    ActionMenu?: IActionMenuItem[];
    /** Current sort descriptor ref */
    sortRef?: SortDescriptor;
    /** Formik form ref (for submitting on sort/page change) */
    formRef?: React.MutableRefObject<any>;
    /** Page state ref  */
    pageRef?: React.MutableRefObject<{ page: number; limit: number }>;
    /** Total count ref */
    totalCountRef?: React.MutableRefObject<number>;
    /** Callbacks */
    onActiveDeactiveClickReceived?: (row: any) => void;
    onSendNotification?: (row: any) => void;
    onInfoClickReceived?: (row: any) => void;
    onEditClickReceived?: (row: any) => void;
    onDeleteClickReceived?: (id: any) => void;
    onViewClickReceived?: (id: any) => void;
    onSetPageDetailsReceived?: (formValues: any, pageDetails: { page: number; limit: number }) => void;
    onSortDetailsReceived?: (formValues: any, sortData: SortDescriptor) => void;
    onStatusChangeClickReceived?: (userId: string, newStatus: string) => void;
    onStatusChangeRemarkClickReceived?: (user: any, newStatus: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const CustomTable: React.FC<CustomTableProps> = (props) => {
    const {
        columns,
        data,
        isStriped,
        selectionMode,
        selectionBehavior,
        showSelectionCheckboxes,
        selectedKeys,
        defaultSelectedKeys,
        disabledKeys,
        onSelectionChange,
        onRowAction,
        ActiveDeActiveSwitch,
        Info,
        Send,
        Edit,
        Delete,
        View,
        ActionMenu,
        sortRef,
        formRef,
        pageRef,
        totalCountRef,
    } = props;

    // ── Event handlers ──────────────────────────────────────────────────────────

    const handleActiveDeactiveClick = (row: any) =>
        props.onActiveDeactiveClickReceived?.(row);

    const handleSendNotificationClick = (row: any) =>
        props.onSendNotification?.(row);

    const handleInfoClick = (row: any) =>
        props.onInfoClickReceived?.(row);

    const handleEditClick = (row: any) =>
        props.onEditClickReceived?.(row);

    const handleDeleteClick = (id: any) =>
        props.onDeleteClickReceived?.(id);

    const handleViewClick = (id: any) =>
        props.onViewClickReceived?.(id);

    const handleSetPageDetails = (formValues: any, pageDetails: { page: number; limit: number }) =>
        props.onSetPageDetailsReceived?.(formValues, pageDetails);

    const handleSorting = (formValues: any, sortData: SortDescriptor) =>
        props.onSortDetailsReceived?.(formValues, sortData);

    const handleStatusChangeClick = (userId: string, newStatus: string) =>
        props.onStatusChangeClickReceived?.(userId, newStatus);

    // ── Cell renderer ───────────────────────────────────────────────────────────

    const renderCell = React.useCallback((row: any, columnKey: string): React.ReactNode => {
        const cellValue = row[columnKey];

        switch (columnKey) {
            case "index":
                return cellValue + ((pageRef?.current.page ?? 1) - 1) * (pageRef?.current.limit ?? 10);
            case "fullName":
                return (
                    <UserCell
                        className="capitalize"
                        avatarProps={{ radius: "lg", src: row?.image }}
                        name={cellValue}
                    />
                );
            case "status":
                return (
                    <Chip
                        className="capitalize"
                        color={statusColorMap[row.status] ?? "default"}
                        size="sm"
                        variant="flat"
                    >
                        {cellValue}
                    </Chip>
                );
            case "active":
                return (
                    <Chip
                        className="capitalize"
                        color={row?.active ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                    >
                        {row?.active ? "Active" : "Inactive"}
                    </Chip>
                );
            case "created_at": {
                const d = new Date(row?._createdAt ?? "");
                return isNaN(d.getTime())
                    ? "-"
                    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            }
            case "rating":
                return (
                    <Rating
                        value={row?.rating ?? 0}
                        isReadOnly
                        size="sm"
                    />
                );
            case "statusDropdown":
                return (
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="bordered" className="capitalize min-w-[110px]" size="sm">
                                <CgRadioChecked color={ProviderStatusColor[row?.status as ProviderStatusValue]} />
                                {row?.status}
                                <FiChevronDown />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Provider status selection"
                            variant="flat"
                            disallowEmptySelection
                            selectionMode="single"
                            selectedKeys={new Set([row?.status])}
                            onSelectionChange={(e: any) =>
                                handleStatusChangeClick(row?.id, e?.currentKey)
                            }
                        >
                            {Object.values(ProviderStatus).map((value) => (
                                <DropdownItem
                                    key={value}
                                    textValue={value}
                                >
                                    <div className="flex items-center gap-2">
                                        <CgRadioChecked color={ProviderStatusColor[value]} />
                                        {capitalize(value)}
                                    </div>
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-center">
                        {ActiveDeActiveSwitch && (
                            <Switch
                                size="sm"
                                value={row?.is_active ?? false}
                                onChange={() => handleActiveDeactiveClick(row)}
                            />
                        )}
                        {Send && (
                            <Tooltip color="primary" content="Send Notification">
                                <span
                                    className="text-lg text-primary cursor-pointer active:opacity-50"
                                    onClick={() => handleSendNotificationClick(row)}
                                >
                                    <FiBell />
                                </span>
                            </Tooltip>
                        )}
                        {Info && (
                            <Tooltip color="warning" content="Info">
                                <span
                                    className="text-lg text-warning cursor-pointer active:opacity-50"
                                    onClick={() => handleInfoClick(row)}
                                >
                                    <PiInfoBold />
                                </span>
                            </Tooltip>
                        )}
                        {Edit && (
                            <Tooltip content="Edit">
                                <span
                                    className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                    onClick={() => handleEditClick(row)}
                                >
                                    <AiOutlineEdit />
                                </span>
                            </Tooltip>
                        )}
                        {Delete && (
                            <Tooltip color="danger" content="Delete">
                                <span
                                    className="text-lg text-danger cursor-pointer active:opacity-50"
                                    onClick={() => handleDeleteClick(row?.id)}
                                >
                                    <AiOutlineDelete />
                                </span>
                            </Tooltip>
                        )}
                        {View && (
                            <Tooltip color="foreground" content="Details">
                                <span
                                    className="text-lg text-foreground cursor-pointer active:opacity-50"
                                    onClick={() => handleViewClick(row?.id)}
                                >
                                    <AiOutlineEye />
                                </span>
                            </Tooltip>
                        )}
                        {ActionMenu && ActionMenu.length > 0 && (
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="default"
                                        radius="md"
                                        aria-label="More actions"
                                        className="text-default-500 hover:text-default-700"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <circle cx="12" cy="5" r="2" />
                                            <circle cx="12" cy="12" r="2" />
                                            <circle cx="12" cy="19" r="2" />
                                        </svg>
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="More row actions" variant="flat">
                                    {ActionMenu.map((item, i) => (
                                        <DropdownItem
                                            key={`${item.label}-${i}`}
                                            textValue={item.label}
                                            color={item.color ?? "default"}
                                            className={item.color === "danger" ? "text-danger" : undefined}
                                            onClick={() => item.onClick(row)}
                                        >
                                            {item.label}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                );

            default:
                return cellValue ?? "-";
        }
    }, [ActiveDeActiveSwitch, Send, Info, Edit, Delete, View, ActionMenu, pageRef]);

    // ── Render ──────────────────────────────────────────────────────────────────

    return (
        <>
            <Table
                isStriped={isStriped}
                selectionMode={selectionMode}
                selectionBehavior={selectionBehavior}
                showSelectionCheckboxes={showSelectionCheckboxes}
                selectedKeys={selectedKeys}
                defaultSelectedKeys={defaultSelectedKeys}
                disabledKeys={disabledKeys}
                onSelectionChange={onSelectionChange}
                onRowAction={onRowAction}
                isCompact
                removeWrapper
                aria-label="Data table with custom cells, pagination and sorting"
                sortDescriptor={sortRef}
                onSortChange={(sortData: SortDescriptor) =>
                    handleSorting(formRef?.current?.values, sortData)
                }
            >
                <TableHeader columns={columns}>
                    {(column: IColumn) => (
                        <TableColumn
                            key={column?.data}
                            style={{ minWidth: column?.width ? `${column.width}px` : undefined }}
                            align={column?.data === "actions" ? "center" : "start"}
                            allowsSorting={column?.orderable}
                            className={column?.className}
                        >
                            {column?.name ?? ""}
                        </TableColumn>
                    )}
                </TableHeader>

                <TableBody emptyContent="No records found" items={data}>
                    {(item: any) => (
                        <TableRow key={item?.id ?? item?._id}>
                            {columns.map((col) => (
                                <TableCell
                                    key={col?.data}
                                    className={col?.width ? "whitespace-normal" : ""}
                                >
                                    {renderCell(item, col?.data ?? "")}
                                </TableCell>
                            ))}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {props.onSetPageDetailsReceived && pageRef && totalCountRef && (
                <TableFooter
                    totalCount={totalCountRef.current}
                    page={pageRef.current?.page}
                    rowsPerPage={pageRef.current?.limit}
                    onPageChange={(page) =>
                        handleSetPageDetails(
                            formRef?.current?.values,
                            handlePageDetailChange(PageActions.PageChange, page, pageRef.current)
                        )
                    }
                    onRowsPerPageChange={(rowsPerPage) =>
                        handleSetPageDetails(
                            formRef?.current?.values,
                            handlePageDetailChange(
                                PageActions.RowsPerPageChange,
                                rowsPerPage,
                                pageRef.current
                            )
                        )
                    }
                />
            )}
        </>
    );
};

export default CustomTable;