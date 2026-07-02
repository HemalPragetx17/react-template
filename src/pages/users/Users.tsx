import type { ColumnDef } from "@tanstack/react-table";
import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEdit, FiEye } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Chip, ConfirmModal, CustomTable, Input, Modal, SelectDropdown, Switch } from "../../components/ui";
import type { Pagination } from "../../models/base-type";
import type { IUserModal } from "../../models/user";
import { Routing } from "../../routes/routing";
import userService from "../../services/user-service";
import { PAGINATION } from "../../shared/constants/pagination";
import { handleTableLoader } from "../../store/slices/generalSlice";
import UserForm from "./UserForm";

interface IUsersFilter {
  search: string;
  status: string;
}

const initialFilter: IUsersFilter = {
  search: '',
  status: '',
};

let cachedUsersList: IUserModal[] = [
  {
    _id: "user-1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneCountry: "+1",
    phone: "555-0199",
    active: true,
    _createdAt: "2026-01-10T08:30:00.000Z",
  },
  {
    _id: "user-2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phoneCountry: "+44",
    phone: "7700-900077",
    active: true,
    _createdAt: "2026-02-15T09:15:00.000Z",
  },
  {
    _id: "user-3",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@example.com",
    phoneCountry: "+91",
    phone: "98765-43210",
    active: false,
    _createdAt: "2026-03-01T11:00:00.000Z",
  },
  {
    _id: "user-4",
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.b@example.com",
    phoneCountry: "+1",
    phone: "555-0143",
    active: true,
    _createdAt: "2026-04-05T14:20:00.000Z",
  },
  {
    _id: "user-5",
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@example.com",
    phoneCountry: "+61",
    phone: "491-570-156",
    active: true,
    _createdAt: "2026-05-12T10:45:00.000Z",
  },
  {
    _id: "user-6",
    firstName: "Sarah",
    lastName: "Miller",
    email: "sarah.m@example.com",
    phoneCountry: "+49",
    phone: "172-555-019",
    active: false,
    _createdAt: "2026-06-20T16:00:00.000Z",
  },
];

const Users = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [usersList, setUsersList] = useState<IUserModal[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination>(PAGINATION);
  const [filterValues, setFilterValues] = useState<IUsersFilter>(initialFilter);

  const [user, setUser] = useState<IUserModal | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialogDelete, setOpenConfirmDialogDelete] = useState(false);

  const handleDialogOpen = useCallback(() => setOpenDialog(true), []);
  const handleDialogClose = useCallback(() => setOpenDialog(false), []);
  const handleConfirmDialogOpenForDelete = useCallback(() => setOpenConfirmDialogDelete(true), []);
  const handleConfirmDialogCloseForDelete = useCallback(() => setOpenConfirmDialogDelete(false), []);

  const handleStatusToggle = useCallback(async (userId: string, newStatus: boolean) => {
    // Commented API call:
    /*
    await userService
      .toggleUserStatus(userId, { status: newStatus })
      .then(() => {
        toast.success("User status updated successfully!");
        setUsersList((prev) => prev.map((user) => user._id === userId ? { ...user, active: newStatus } : user))
      })
      .catch((error: any) => {
        toast.error(error || "Failed to update status.");
      })
    */

    // Static bypass logic:
    toast.success("User status updated successfully!");
    cachedUsersList = cachedUsersList.map((user) => user._id === userId ? { ...user, active: newStatus } : user);
    setUsersList((prev) => prev.map((user) => user._id === userId ? { ...user, active: newStatus } : user));
  }, []);

  const handleView = useCallback((user: IUserModal) => {
    setUser(user);
    navigate(Routing.UserDetails, { state: { user } });
  }, [navigate]);

  const handleEdit = useCallback((user: IUserModal) => {
    setUser(user);
    handleDialogOpen();
  }, [handleDialogOpen]);

  const handleDelete = useCallback((user: IUserModal) => {
    setUser(user);
    handleConfirmDialogOpenForDelete();
  }, [handleConfirmDialogOpenForDelete]);

  const columns: ColumnDef<IUserModal>[] = useMemo(() => [
    {
      accessorKey: "firstName",
      header: "Name",
      enableSorting: true,
      cell: ({ row }) => {
        const val = row.original.firstName + " " + row.original.lastName;
        if (!val) return <span className="text-gray-400">-</span>;
        return val;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
      cell: ({ row }) => {
        const val = row.original.phoneCountry + " " + row.original.phone;
        if (!val) return <span className="text-gray-400">-</span>;
        return val;
      },
    },
    {
      accessorKey: "joiningDate",
      header: "Joining Date",
      cell: ({ row }) => {
        const val = row.original._createdAt;
        if (!val) return <span className="text-gray-400">-</span>;
        const date = new Date(val);
        return isNaN(date.getTime()) ? val : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: "active",
      header: "Status",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const isActive = row.original.active;
        return (
          <Chip
            variant="dot"
            color={isActive ? "success" : "danger"}
            size="sm"
          >
            {isActive ? "Active" : "Inactive"}
          </Chip>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Status Toggle",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const isActive = row.original.active;
        const userId = row.original._id;
        return (
          <div className="flex items-center justify-center">
            <Switch
              size="sm"
              color="success"
              variant="outside"
              value={isActive}
              onChange={(checked) => {
                if (userId) {
                  handleStatusToggle(userId, checked);
                }
              }}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              isIconOnly
              size="md"
              radius="full"
              variant="light"
              color="primary"
              title="View"
              onClick={() => handleView(row.original)}
            >
              <FiEye className="h-6 w-6" aria-hidden />
            </Button>
            <Button
              isIconOnly
              size="md"
              radius="full"
              variant="light"
              color="warning"
              title="Edit"
              onClick={() => handleEdit(row.original)}
            >
              <FiEdit className="h-6 w-6" aria-hidden />
            </Button>
            <Button
              isIconOnly
              size="md"
              radius="full"
              variant="light"
              color="danger"
              title="Delete"
              onClick={() => handleDelete(row.original)}
            >
              <FaRegTrashCan className="h-6 w-6" aria-hidden />
            </Button>
          </div>
        );
      },
    }
  ], [handleStatusToggle, handleView, handleEdit, handleDelete]);

  useEffect(() => {
    getUsers(filterValues);
  }, []);

  const debouncedSearch = useMemo(() =>
    debounce((filter: IUsersFilter, page: number, limit: number) => {
      getUsers(filter, page, limit);
    }, 400),
    []
  );

  useEffect(() => {
    return () => { debouncedSearch.cancel(); };
  }, []);

  const getUsers = async (filter: IUsersFilter, page: number = pagination.page, limit: number = pagination.limit) => {
    dispatch(handleTableLoader(true));

    // Static bypass logic:
    setTimeout(() => {
      let filtered = [...cachedUsersList];

      // Apply search filter
      if (filter?.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.firstName.toLowerCase().includes(searchLower) ||
            u.lastName.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower) ||
            u.phone.includes(searchLower)
        );
      }

      // Apply status filter
      if (filter?.status && filter.status !== '') {
        const activeOnly = filter.status === "true";
        filtered = filtered.filter((u) => u.active === activeOnly);
      }

      setTotalRecords(filtered.length);

      // Paginate
      const start = (page - 1) * limit;
      const end = start + limit;
      setUsersList(filtered.slice(start, end));

      dispatch(handleTableLoader(false));
    }, 200);

    /* Commented API call:
    const params: any = {
      pageNo: page,
      limit: limit,
      sortKey: "_createdAt",
      sortOrder: "-1",
      needCount: true,
      searchTerm: filter?.search || "",
    };

    if (filter?.status && filter.status !== '') {
      params.active = filter.status === "true";
    }

    await userService
      .getAllUsers(params)
      .then((response: any) => {
        if (response) {
          setTotalRecords(response?.total || 0);
          setUsersList(response?.records || []);
        } else {
          setTotalRecords(0);
          setUsersList([]);
        }
      })
      .catch((error: Error) => console.log(error?.message))
      .finally(() => dispatch(handleTableLoader(false)));
    */
  };

  const handlePageChange = useCallback((newPagination: { page: number; limit: number }) => {
    if (pagination.page !== newPagination.page || pagination.limit !== newPagination.limit) {
      setPagination(newPagination);
      getUsers(filterValues, newPagination.page, newPagination.limit);
    }
  }, [pagination, filterValues]);

  const handleAddUserSubmit = useCallback(() => {
    getUsers(filterValues, pagination.page, pagination.limit);
    setOpenDialog(false);
  }, [filterValues, pagination]);

  const handleAdd = useCallback(() => {
    setUser(null);
    handleDialogOpen();
  }, [handleDialogOpen]);

  const handleDeleteConfirm = useCallback(() => {
    handleConfirmDialogCloseForDelete();
  }, [handleConfirmDialogCloseForDelete]);

  return (
    <section>
      <div className="flex justify-between items-center">
        <p className="text-2xl">Users</p>
        <Button size="lg" onClick={handleAdd}>
          Add User
        </Button>
      </div>

      <Formik
        initialValues={initialFilter}
        onSubmit={(data: IUsersFilter) => {
          setPagination(prev => ({ ...prev, page: 1 }));
          setFilterValues(data);
          getUsers(data, 1, pagination.limit);
        }}
        enableReinitialize
        onReset={() => {
          setPagination(prev => ({ ...prev, page: 1 }));
          setFilterValues(initialFilter);
          getUsers(initialFilter, 1, pagination.limit);
        }}
      >
        {(props) => {
          const { handleSubmit, setFieldValue } = props;
          return (
            <Form onSubmit={handleSubmit} noValidate className='my-5'>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field
                  name="search"
                  placeholder="Search by name"
                  component={Input}
                  startContent={
                    <FaSearch className="w-4 h-4" aria-hidden />
                  }
                  onChange={(e: any) => {
                    const value = e?.target ? e.target.value : e;
                    setFieldValue('search', value);
                    const newFilter = { ...filterValues, search: value };
                    setFilterValues(newFilter);
                    setPagination(prev => ({ ...prev, page: 1 }));
                    debouncedSearch(newFilter, 1, pagination.limit);
                  }}
                  isClearable={true}
                />

                <Field
                  name="status"
                  placeholder="Select status"
                  component={SelectDropdown}
                  options={[
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" }
                  ]}
                  isClearable={true}
                  onChange={(option: any) => {
                    const value = option ? option.value : '';
                    setFieldValue('status', value);
                    const newFilter = { ...filterValues, status: value };
                    setFilterValues(newFilter);
                    setPagination(prev => ({ ...prev, page: 1 }));
                    getUsers(newFilter, 1, pagination.limit);
                  }}
                />
              </div>
            </Form>
          );
        }}
      </Formik>

      <CustomTable
        data={usersList}
        columns={columns}
        enablePagination
        manualPagination
        pagination={pagination}
        onPaginationChange={handlePageChange}
        enableCheckbox
        enableSorting
        defaultSortKey="firstName"
        defaultSortOrder="desc"
        totalCount={totalRecords}
      />

      <Modal
        openDialog={openDialog}
        handleDialogClose={handleDialogClose}
        title="Add New User"
        size="lg"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <UserForm
          user={user}
          onUserAdd={handleAddUserSubmit}
          handleDialogClose={handleDialogClose}
        />
      </Modal>

      <ConfirmModal
        title="Delete User"
        openDialog={openConfirmDialogDelete}
        handleDialogClose={handleConfirmDialogCloseForDelete}
        message={`Are you sure you want to delete ${user?.firstName} ${user?.lastName} ?`}
        handleSuccess={handleDeleteConfirm}
      />
    </section>
  );
};

export default Users;
