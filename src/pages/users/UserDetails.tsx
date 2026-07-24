import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Chip } from "../../components/ui";
import type { IAppointmentModal } from "../../models/appointment";
import type { Pagination } from "../../models/base-type";
import { Routing } from "../../routes/routing";
import { DEFAULT_PAGE_SIZE } from "../../shared/constants/pagination";
import { TanstackTable } from "../../components/custom-table/TanstackTable";

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

const STATIC_APPOINTMENTS: IAppointmentModal[] = [
  {
    _id: "apt-1",
    appointmentNo: 1001,
    appointmentDate: "2026-07-05T09:00:00Z",
    acuityLevel: 2,
    status: 2, // Confirmed
    heartRate: 72,
    systolicBp: "120",
    diastolicBp: "80",
    patient: {
      reference: "pat-1",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@example.com",
      userType: 1
    },
    specialist: {
      reference: "spec-1",
      firstName: "Dr. Robert",
      lastName: "Chen",
      email: "robert.chen@example.com",
      userType: 2
    },
    referredBy: {
      reference: "ref-1",
      firstName: "Dr. Sarah",
      lastName: "Adams",
      email: "sarah.adams@example.com",
      userType: 2
    },
    timeSlots: {
      reference: "slot-1",
      startTime: "09:00 AM",
      endTime: "09:30 AM",
      duration: 30
    },
    pill: [],
    media: [],
    ecgReports: [],
    medicalTests: [],
    hrRate: [],
    bpRate: []
  },
  {
    _id: "apt-2",
    appointmentNo: 1002,
    appointmentDate: "2026-07-05T10:00:00Z",
    acuityLevel: 1,
    status: 3, // Completed
    heartRate: 68,
    systolicBp: "115",
    diastolicBp: "75",
    patient: {
      reference: "pat-2",
      firstName: "Bob",
      lastName: "Smith",
      email: "bob.smith@example.com",
      userType: 1
    },
    specialist: {
      reference: "spec-2",
      firstName: "Dr. Emily",
      lastName: "Taylor",
      email: "emily.taylor@example.com",
      userType: 2
    },
    referredBy: {
      reference: "ref-2",
      firstName: "Dr. James",
      lastName: "Carter",
      email: "james.carter@example.com",
      userType: 2
    },
    timeSlots: {
      reference: "slot-2",
      startTime: "10:00 AM",
      endTime: "10:30 AM",
      duration: 30
    },
    pill: [],
    media: [],
    ecgReports: [],
    medicalTests: [],
    hrRate: [],
    bpRate: []
  },
  {
    _id: "apt-3",
    appointmentNo: 1003,
    appointmentDate: "2026-07-06T11:00:00Z",
    acuityLevel: 3,
    status: 1, // Pending
    heartRate: 85,
    systolicBp: "135",
    diastolicBp: "88",
    patient: {
      reference: "pat-3",
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie.brown@example.com",
      userType: 1
    },
    specialist: {
      reference: "spec-1",
      firstName: "Dr. Robert",
      lastName: "Chen",
      email: "robert.chen@example.com",
      userType: 2
    },
    referredBy: {
      reference: "ref-3",
      firstName: "Dr. Mary",
      lastName: "Watson",
      email: "mary.watson@example.com",
      userType: 2
    },
    timeSlots: {
      reference: "slot-3",
      startTime: "11:00 AM",
      endTime: "11:30 AM",
      duration: 30
    },
    pill: [],
    media: [],
    ecgReports: [],
    medicalTests: [],
    hrRate: [],
    bpRate: []
  },
  {
    _id: "apt-4",
    appointmentNo: 1004,
    appointmentDate: "2026-07-07T14:00:00Z",
    acuityLevel: 2,
    status: 4, // Cancelled
    heartRate: 75,
    systolicBp: "122",
    diastolicBp: "78",
    patient: {
      reference: "pat-4",
      firstName: "Diana",
      lastName: "Prince",
      email: "diana.prince@example.com",
      userType: 1
    },
    specialist: {
      reference: "spec-3",
      firstName: "Dr. Bruce",
      lastName: "Wayne",
      email: "bruce.wayne@example.com",
      userType: 2
    },
    referredBy: {
      reference: "ref-4",
      firstName: "Dr. Clark",
      lastName: "Kent",
      email: "clark.kent@example.com",
      userType: 2
    },
    timeSlots: {
      reference: "slot-4",
      startTime: "02:00 PM",
      endTime: "02:30 PM",
      duration: 30
    },
    pill: [],
    media: [],
    ecgReports: [],
    medicalTests: [],
    hrRate: [],
    bpRate: []
  }
];

const UserDetails = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<IAppointmentModal[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: DEFAULT_PAGE_SIZE });
  const [loading, setLoading] = useState(false);

  const getAppointments = useCallback(async (limit: number) => {
    setLoading(true);

    // Static bypass logic:
    setTimeout(() => {
      setTotalRecords(STATIC_APPOINTMENTS.length);
      setAppointments(STATIC_APPOINTMENTS.slice(0, limit));
      setLoading(false);
    }, 200);

    /* Commented API call:
    const params: Record<string, unknown> = {
      pageNo: 1,
      limit,
      sortKey: "acuityLevel",
      sortOrder: "-1",
      needCount: true,
      searchTerm: "",
    };

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
    */
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

      <TanstackTable
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
