import {
    Wrench,
    CalendarDays,
    Clock,
    CheckCircle,
    IndianRupee,
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    X,
    AlertCircle,
    RefreshCw,
    LoaderCircle,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import useMaintenance from "../hooks/useMaintenance";
import SearchableDropdown from "../components/SearchableDropdown";

import {
    maintenanceServiceTypes,
    maintenanceStatuses,
} from "../data/maintenanceData";

// LOADING SKELETON
function MaintenanceTableSkeleton() {
    return (
        <div className="w-full animate-pulse">
            <div className="grid grid-cols-8 gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
                {[
                    "Maintenance ID",
                    "Vehicle",
                    "Registration",
                    "Service",
                    "Date",
                    "Cost",
                    "Status",
                    "Actions",
                ].map((item) => (
                    <div
                        key={item}
                        className="h-2.5 rounded bg-slate-200"
                    />
                ))}
            </div>

            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="grid grid-cols-8 items-center gap-4 border-b border-slate-100 px-4 py-4"
                >
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                        <div
                            key={cellIndex}
                            className="h-3 rounded bg-slate-200"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// TOP RIGHT SNACKBAR

// TOP RIGHT SNACKBAR
function MaintenanceSnackbar({ notification, onClose }) {
    if (!notification) return null;

    const isError = notification.type === "error";

    return (
        <div
            role="alert"
            className={`fixed right-5 top-20 z-[2000] flex w-[340px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-lg border p-3 shadow-lg ${
                isError
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
            }`}
        >
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isError
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                }`}
            >
                {isError ? (
                    <AlertCircle size={17} />
                ) : (
                    <CheckCircle size={17} />
                )}
            </div>

            <p
                className={`flex-1 text-xs font-medium ${
                    isError ? "text-red-700" : "text-green-700"
                }`}
            >
                {notification.message}
            </p>

            <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
}


// SUMMARY CARD
function SummaryCard({ title, value, icon: Icon, style, loading }) {
    return (
        <div className="flex min-h-[60px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md${style}`}>
                <Icon size={16} />
            </div>

            <span className="min-w-0 text-[11px] font-medium text-slate-500">
                {title}
            </span>

            <strong className="ml-auto text-lg font-bold leading-none text-[#17243b] tabular-nums">
                {loading ? "—" : value}
            </strong>
        </div>
    );
}

export default function Maintenance() {
    const {
        filteredRecords,
        vehicles,

        loading,
        saving,
        deleting,
        error,
        fetchData,

        notification,
        dismissNotification,

        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        serviceFilter,
        setServiceFilter,

        totalRecords,
        scheduledCount,
        inProgressCount,
        completedCount,
        totalCost,

        isModalOpen,
        modalMode,
        form,
        selectedRecord,

        openAddModal,
        openEditModal,
        openViewModal,
        closeModal,
        handleChange,
        submitMaintenance,

        deleteRecord,
        handleDelete,
        confirmDelete,
        cancelDelete,
    } = useMaintenance();

    const summaryCards = [
        {
            title: "Total Records",
            value: totalRecords,
            icon: Wrench,
            style: "bg-blue-50 text-blue-600",
        },
        {
            title: "Scheduled",
            value: scheduledCount,
            icon: CalendarDays,
            style: "bg-orange-50 text-orange-600",
        },
        {
            title: "In Progress",
            value: inProgressCount,
            icon: Clock,
            style: "bg-amber-50 text-amber-600",
        },
        {
            title: "Completed",
            value: completedCount,
            icon: CheckCircle,
            style: "bg-green-50 text-green-600",
        },
        {
            title: "Total Cost",
            value: `₹${totalCost.toLocaleString("en-IN")}`,
            icon: IndianRupee,
            style: "bg-purple-50 text-purple-600",
        },
    ];

    const columns = [
        {
            key: "maintenanceId",
            label: "Maintenance ID",
            render: (value) => (
                <span className="font-semibold text-blue-600">
                    {value}
                </span>
            ),
        },
        {
            key: "vehicle",
            label: "Vehicle",
            render: (value) => (
                <span className="font-medium text-slate-700">
                    {value}
                </span>
            ),
        },
        {
            key: "registrationNumber",
            label: "Registration No.",
        },
        {
            key: "serviceType",
            label: "Service Type",
        },
        {
            key: "serviceDate",
            label: "Service Date",
        },
        {
            key: "cost",
            label: "Cost",
            render: (value) =>
                `₹${Number(value || 0).toLocaleString("en-IN")}`,
        },
        {
            key: "status",
            label: "Status",
            render: (value) => {
                const styles = {
                    Scheduled: "bg-orange-50 text-orange-700",
                    "In Progress": "bg-amber-50 text-amber-700",
                    Completed: "bg-green-50 text-green-700",
                };

                return (
                    <span
                        className={`inline - flex rounded-full px-2.5 py - 1 text - [10px] font - semibold ${styles[value] || "bg-slate-100 text-slate-600"
                            } `}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, record) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        title="View"
                        onClick={() => openViewModal(record)}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Eye size={14} />
                    </button>

                    <button
                        type="button"
                        title="Edit"
                        onClick={() => openEditModal(record)}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Pencil size={14} />
                    </button>

                    <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(record)}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    const inputClass =
        "min-h-[36px] w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const labelClass = "text-[11px] font-semibold text-slate-600";

    const isView = modalMode === "view";

    return (
        <AdminLayout>
            <MaintenanceSnackbar
                notification={notification}
                onClose={dismissNotification}
            />

            <div className="mx-auto flex min-h-[calc(100dvh-135px)] w-full max-w-[1600px] flex-col gap-2">

                {/* HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-bold text-[#17243b]">
                            Maintenance
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Manage vehicle services and maintenance history.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        disabled={loading || vehicles.length === 0}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#3158c9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus size={15} />
                        Add Maintenance
                    </button>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
                    {summaryCards.map((item) => (
                        <SummaryCard
                            key={item.title}
                            {...item}
                            loading={loading}
                        />
                    ))}
                </div>

                {/* TABLE SECTION */}
                <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">

                    {/* TABLE HEADING */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                        <div>
                            <h2 className="text-sm font-semibold text-[#17243b]">
                                All Maintenance Records
                            </h2>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                                View and manage vehicle service records.
                            </p>
                        </div>

                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                            {loading
                                ? "Loading..."
                                : `${filteredRecords.length} Records`
                            }
                        </span >
                    </div >

                    {/* SEARCH + FILTERS - SAME ROW */}
                    < div className="flex flex-col gap-2 px-4 pb-2 sm:flex-row" >
                        <div className="flex min-h-[34px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 focus-within:border-blue-500">
                            <Search size={15} />

                            <input
                                type="text"
                                placeholder="Search maintenance ID, vehicle or registration..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="min-h-[34px] rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 outline-none focus:border-blue-500"
                        >
                            <option value="All">All Status</option>
                            {maintenanceStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>

                        <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                            className="min-h-[34px] rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 outline-none focus:border-blue-500"
                        >
                            <option value="All">All Services</option>
                            {maintenanceServiceTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div >

                    {/* LOADING / ERROR / TABLE */}
                    < div className="flex-1" >
                        {
                            loading ? (
                                <MaintenanceTableSkeleton />
                            ) : error && filteredRecords.length === 0 ? (
                                <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 text-center">
                                    <AlertCircle
                                        size={28}
                                        className="text-red-400"
                                    />

                                    <p className="text-sm font-semibold text-slate-700">
                                        Unable to load maintenance records
                                    </p>

                                    <p className="max-w-sm text-xs text-slate-400">
                                        {error}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={fetchData}
                                        className="mt-1 flex items-center gap-1.5 rounded-lg bg-[#3158c9] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                                    >
                                        <RefreshCw size={13} />
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={filteredRecords}
                                    pageSize={5}
                                    compact
                                    emptyMessage="No maintenance records found"
                                />
                            )
                        }
                    </div >
                </section >

                {/* ADD / EDIT / VIEW MODAL */}
                < Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={
                        isView
                            ? "Maintenance Details"
                            : modalMode === "edit"
                                ? "Edit Maintenance"
                                : "Add New Maintenance"
                    }
                    size="large"
                >
                    {
                        isView ? (
                            <div>
                                {selectedRecord && (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {[
                                            ["Maintenance ID", selectedRecord.maintenanceId],
                                            ["Vehicle", selectedRecord.vehicle],
                                            ["Registration Number", selectedRecord.registrationNumber],
                                            ["Service Type", selectedRecord.serviceType],
                                            ["Service Date", selectedRecord.serviceDate],
                                            ["Next Service Date", selectedRecord.nextServiceDate || "-"],
                                            ["Odometer", `${selectedRecord.odometer} KM`],
                                            ["Service Provider", selectedRecord.serviceProvider],
                                            ["Cost", `₹${Number(selectedRecord.cost).toLocaleString("en-IN")}`],
                                            ["Status", selectedRecord.status],
                                            ["Description", selectedRecord.description || "-"],
                                        ].map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="rounded-md bg-slate-50 p-3"
                                            >
                                                <p className="text-[10px] text-slate-500">
                                                    {label}
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-slate-800">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end border-t pt-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                                    >
                                        <X size={14} />
                                        Close
                                    </button>
                                </div>
                            </div >
                        ) : (
                            <form onSubmit={submitMaintenance}>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                    {/* VEHICLE */}
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className={labelClass}>
                                            Select Vehicle *
                                        </label>

                                        <SearchableDropdown
                                            value={form.vehicleId}
                                            onChange={(value) => handleChange("vehicleId", value)}
                                            options={vehicles.map((vehicle) => ({
                                                value: vehicle.id,
                                                label: `${vehicle.name} - ${vehicle.number}`,
                                                keywords: `${vehicle.name} ${vehicle.number} ${vehicle.category || ""}`,
                                            }))}
                                            placeholder="Select vehicle"
                                            searchPlaceholder="Search vehicle name or registration..."
                                            className="min-h-[36px]"
                                        />
                                    </div>

                                    {/* SERVICE TYPE */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>
                                            Service Type *
                                        </label>

                                        <select
                                            required
                                            value={form.serviceType}
                                            onChange={(e) =>
                                                handleChange("serviceType", e.target.value)
                                            }
                                            className={inputClass}
                                        >
                                            {maintenanceServiceTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* STATUS */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>
                                            Status
                                        </label>

                                        <select
                                            value={form.status}
                                            onChange={(e) =>
                                                handleChange("status", e.target.value)
                                            }
                                            className={inputClass}
                                        >
                                            {maintenanceStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {[
                                        ["serviceDate", "Service Date", "date", true],
                                        ["nextServiceDate", "Next Service Date", "date", false],
                                        ["odometer", "Odometer (KM)", "number", true],
                                        ["serviceProvider", "Service Provider", "text", true],
                                        ["cost", "Service Cost (₹)", "number", true],
                                    ].map(([name, label, type, required]) => (
                                        <div
                                            key={name}
                                            className="flex flex-col gap-1.5"
                                        >
                                            <label className={labelClass}>
                                                {label}{required ? " *" : ""}
                                            </label>

                                            <input
                                                type={type}
                                                required={required}
                                                min={type === "number" ? 0 : undefined}
                                                value={form[name] ?? ""}
                                                onChange={(e) =>
                                                    handleChange(name, e.target.value)
                                                }
                                                className={inputClass}
                                            />
                                        </div>
                                    ))}

                                    {/* DESCRIPTION */}
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className={labelClass}>
                                            Description / Notes
                                        </label>

                                        <textarea
                                            rows={2}
                                            value={form.description}
                                            onChange={(e) =>
                                                handleChange("description", e.target.value)
                                            }
                                            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                                    >
                                        <X size={14} />
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-1.5 rounded-lg bg-[#3158c9] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <LoaderCircle
                                                size={14}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <CheckCircle size={14} />
                                        )}

                                        {saving
                                            ? "Saving..."
                                            : modalMode === "edit"
                                                ? "Update Record"
                                                : "Save Record"}
                                    </button>
                                </div>
                            </form>
                        )}
                </Modal >

                {/* DELETE CONFIRMATION */}
                < Modal
                    isOpen={Boolean(deleteRecord)}
                    onClose={cancelDelete}
                    title="Delete Maintenance Record"
                >
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertCircle size={19} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Are you sure you want to delete?
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Maintenance record{" "}
                                    <strong>{deleteRecord?.maintenanceId}</strong>{" "}
                                    will be permanently deleted.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-3">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                disabled={deleting}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleting ? (
                                    <LoaderCircle
                                        size={13}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Trash2 size={13} />
                                )}
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </Modal >
            </div >
        </AdminLayout >
    );
}
