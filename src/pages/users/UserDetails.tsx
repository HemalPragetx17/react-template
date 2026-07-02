import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Chip, CustomTable } from "../../components/ui";
import type { IAppointmentListResponse, IAppointmentModal } from "../../models/appointment";
import type { Pagination } from "../../models/base-type";
import { Routing } from "../../routes/routing";
import userService from "../../services/user-service";
import { DEFAULT_PAGE_SIZE } from "../../shared/constants/pagination";

const APPOINTMENT_STATUS_MAP: Record<number, { label: string; color: "success" | "warning" | "danger" | "primary" | "default" }> = {
  1: { label: "Pending", color: "warning" },
  2: { label: "Confirmed", color: "success" },
  3: { label: "Completed", color: "primary" },
  4: { label: "Cancelled", color: "danger" },
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getFullName = (firstName?: string, lastName?: string) =>
  `${firstName ?? ""} ${lastName ?? ""}`.trim();

const UserDetails = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<IAppointmentModal[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: DEFAULT_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  const getAppointments = useCallback(async (limit: number) => {
    const params: Record<string, unknown> = {
      pageNo: 1,
      limit,
      sortKey: "acuityLevel",
      sortOrder: "-1",
      needCount: true,
      searchTerm: "",
    };

    setLoading(true);
    await userService
      .getAllAppointments(params)
      .then((response) => {
        const payload = response?.records
          ? response
          : (response as { data?: IAppointmentListResponse })?.data;

        if (payload) {
          setTotalRecords(payload.total || 0);
          setAppointments(payload.records || []);
        } else {
          setTotalRecords(0);
          setAppointments([]);
        }
      })
      .catch((error: Error) => console.log(error?.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getAppointments(pagination.limit);
  }, [getAppointments]);

  const handlePaginationChange = useCallback((next: { page: number; limit: number }) => {
    if (next.limit !== pagination.limit) {
      setPagination({ page: 1, limit: next.limit });
      getAppointments(next.limit);
    }
  }, [pagination.limit, getAppointments]);

  const columns: ColumnDef<IAppointmentModal>[] = useMemo(() => [
    {
      accessorKey: "appointmentDate",
      header: "Date",
      enableSorting: true,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: "patient",
      header: "Patient",
      enableSorting: true,
      accessorFn: (row) => getFullName(row.patient.firstName, row.patient.lastName),
      cell: ({ row }) => {
        const name = getFullName(row.original.patient.firstName, row.original.patient.lastName);
        return (
          <div className="flex items-center gap-3">
            <Avatar name={name} size="sm" color="primary" />
            <div>
              <p className="font-semibold text-gray-800">{name}</p>
              <p className="text-xs text-gray-500">{row.original.patient.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "specialist",
      header: "Specialist",
      accessorFn: (row) => getFullName(row.specialist.firstName, row.specialist.lastName),
      cell: ({ row }) => getFullName(row.original.specialist.firstName, row.original.specialist.lastName),
    },
    {
      id: "referredBy",
      header: "Referred By",
      accessorFn: (row) => getFullName(row.referredBy.firstName, row.referredBy.lastName),
      cell: ({ row }) => getFullName(row.original.referredBy.firstName, row.original.referredBy.lastName),
    },
    {
      id: "timeSlot",
      header: "Time Slot",
      cell: ({ row }) => {
        const slot = row.original.timeSlots;
        return `${slot.startTime} - ${slot.endTime}`;
      },
    },
    {
      accessorKey: "acuityLevel",
      header: "Acuity",
      enableSorting: true,
      meta: {
        align: "center",
      },
      cell: ({ getValue }) => (
        <Chip variant="flat" color="warning" size="sm">
          Level {getValue() as number}
        </Chip>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: {
        align: "center",
      },
      cell: ({ getValue }) => {
        const status = getValue() as number;
        const config = APPOINTMENT_STATUS_MAP[status] ?? { label: `Status ${status}`, color: "default" as const };
        return (
          <Chip variant="dot" color={config.color} size="sm">
            {config.label}
          </Chip>
        );
      },
    },
    {
      id: "vitals",
      header: "Vitals",
      cell: ({ row }) => {
        const { heartRate, systolicBp, diastolicBp } = row.original;
        return (
          <span className="text-xs text-gray-600">
            HR: {heartRate ?? "-"} | BP: {systolicBp ?? "-"}/{diastolicBp ?? "-"}
          </span>
        );
      },
    },
  ], []);

  const handleBack = () => {
    navigate(Routing.Users);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-2xl font-semibold text-gray-800">User Details</p>
          <p className="text-sm text-gray-500">Scroll the table to load more appointments</p>
        </div>
        <Button type="button" variant="bordered" onClick={handleBack} className="shadow-sm">
          Back to Users
        </Button>
      </div>

      <CustomTable
        data={appointments}
        columns={columns}
        enablePagination
        enableInfiniteScroll
        manualPagination
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        totalCount={totalRecords}
        infiniteScrollStep={DEFAULT_PAGE_SIZE}
        infiniteScrollMaxHeight="25.5rem"
        loading={loading}
        isStriped
        scrollBehavior="inside"
      />
    </section>
  );
};

export default UserDetails;
