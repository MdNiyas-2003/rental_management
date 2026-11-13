import {
    CalendarDays,
    CarFront,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    Plus,
    Search,
    Trash2,
    Pencil,
    XCircle,
    Users,
    RefreshCw,
    AlertTriangle,
    X,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import useBookings from "../hooks/useBookings";

const money = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const dateFormat = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const statusStyle = {
    Pending: "bg-amber-50 text-amber-700",
    Confirmed: "bg-blue-50 text-blue-700",
    Active: "bg-emerald-50 text-emerald-700",
    Completed: "bg-slate-100 text-slate-600",
    Cancelled: "bg-red-50 text-red-600",
};

const inputClass =
    "min-h-[36px] w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "text-[11px] font-semibold text-slate-600";

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle[status] || "bg-slate-100 text-slate-600"
                }`}
        >
            {status}
        </span>
    );
}

function SummaryCard({ icon: Icon, label, value, color }) {
    return (
        <div className="flex min-h-[60px] min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md${color}`}
            >
                <Icon size={16} />
            </div>

            <span className="min-w-0 text-[11px] font-medium text-slate-500">
                {label}
            </span>

            <strong className="ml-auto text-lg font-bold leading-none text-[#17243b] tabular-nums">
                {value}
            </strong>
        </div>
    );
}

export default function Bookings() {
    const {
        bookings,
        filteredBookings,
        customers,
        availableVehicles,
        selectedVehicle,

        loading,
        saving,
        deleting,
        error,
        notification,

        search,
        setSearch,
        statusFilter,
        setStatusFilter,

        summary,
        form,
        setField,
        totalDays,
        dailyRate,
        totalAmount,

        modalOpen,
        editingBooking,
        viewingBooking,
        deleteTarget,
        setDeleteTarget,

        openCreateModal,
        openEditModal,
        openViewModal,
        closeModal,
        saveBooking,
        updateStatus,
        confirmDelete,
        loadData,
        dismissNotification,
    } = useBookings();

    const columns = [
        {
            key: "bookingId",
            label: "BOOKING ID",
            render: (value) => (
                <span className="font-semibold text-blue-700">
                    {value}
                </span>
            ),
        },
        {
            key: "customerName",
            label: "CUSTOMER",
            render: (_, row) => (
                <div>
                    <p className="font-medium text-slate-700">
                        {row.customerName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        {row.customerPhone || row.customerEmail}
                    </p>
                </div>
            ),
        },
        {
            key: "vehicleName",
            label: "VEHICLE",
            render: (_, row) => (
                <div>
                    <p className="font-medium text-slate-700">
                        {row.vehicleName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        {row.vehicleNumber}
                    </p>
                </div>
            ),
        },
        {
            key: "pickupDate",
            label: "PICKUP",
            render: (value) => dateFormat(value),
        },
        {
            key: "returnDate",
            label: "RETURN",
            render: (value) => dateFormat(value),
        },
        {
            key: "totalAmount",
            label: "TOTAL AMOUNT",
            render: (value) => (
                <span className="font-semibold text-slate-700">
                    {money(value)}
                </span>
            ),
        },
        {
            key: "status",
            label: "STATUS",
            render: (value) => <StatusBadge status={value} />,
        },
        {
            key: "actions",
            label: "ACTIONS",
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        title="View booking"
                        onClick={() => openViewModal(row)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Eye size={15} />
                    </button>

                    {["Pending", "Confirmed"].includes(row.status) && (
                        <button
                            type="button"
                            title="Edit booking"
                            onClick={() => openEditModal(row)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                        >
                            <Pencil size={14} />
                        </button>
                    )}

                    {row.status === "Pending" && (
                        <button
                            type="button"
                            title="Confirm booking"
                            onClick={() => updateStatus(row, "Confirmed")}
                            className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                        >
                            <CheckCircle2 size={15} />
                        </button>
                    )}

                    {row.status === "Confirmed" && (
                        <button
                            type="button"
                            title="Start rental"
                            onClick={() => updateStatus(row, "Active")}
                            className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                        >
                            <CarFront size={15} />
                        </button>
                    )}

                    {row.status === "Active" && (
                        <button
                            type="button"
                            title="Complete booking"
                            onClick={() => updateStatus(row, "Completed")}
                            className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                        >
                            <CheckCircle2 size={15} />
                        </button>
                    )}

                    {["Pending", "Confirmed"].includes(row.status) && (
                        <button
                            type="button"
                            title="Cancel booking"
                            onClick={() => updateStatus(row, "Cancelled")}
                            className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                        >
                            <XCircle size={15} />
                        </button>
                    )}

                    {row.status !== "Active" && (
                        <button
                            type="button"
                            title="Delete booking"
                            onClick={() => setDeleteTarget(row)}
                            className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="mx-auto flex min-h-[calc(100dvh-135px)] w-full max-w-[1600px] flex-col gap-2">

                {/* Notification */}
                {notification && (
                    <div
                        className={`fixed right-5 top-20 z-[100] flex w-[340px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-lg border p-3 shadow-lg ${notification.type === "error"
                                ? "border-red-200 bg-red-50"
                                : "border-green-200 bg-green-50"
                            }`}> <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                            >
                            {notification.type === "error" ? (
                                <AlertTriangle size={17} />
                            ) : (
                                <CheckCircle2 size={17} />
                            )}
                        </div>

                        <p
                            className={`flex-1 text-xs font-medium ${notification.type === "error"
                                    ? "text-red-700"
                                    : "text-green-700"
                                }`}
                        >
                            {notification.message}
                        </p>

                        <button
                            type="button"
                            onClick={dismissNotification}
                            className="text-slate-400 hover:text-slate-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Page Heading */}
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-[#17243b]">Bookings</h1>
                        <p className="mt-0.5 text-xs text-slate-500">Manage vehicle reservations and rental bookings.</p>
                    </div>
                    <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                        <button type="button" onClick={loadData}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button type="button" onClick={openCreateModal}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#3158c9] px-4 text-xs font-semibold text-white hover:bg-blue-800">
                            <Plus size={15} /> New Booking
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
                    <SummaryCard
                        icon={CalendarDays}
                        label="Total Bookings"
                        value={summary.total}
                        color="bg-blue-50 text-blue-600"
                    />
                    <SummaryCard
                        icon={Clock3}
                        label="Pending"
                        value={summary.pending}
                        color="bg-amber-50 text-amber-600"
                    />
                    <SummaryCard
                        icon={CheckCircle2}
                        label="Confirmed"
                        value={summary.confirmed}
                        color="bg-sky-50 text-sky-600"
                    />
                    <SummaryCard
                        icon={CarFront}
                        label="Active Rentals"
                        value={summary.active}
                        color="bg-emerald-50 text-emerald-600"
                    />
                    <SummaryCard
                        icon={FileText}
                        label="Completed"
                        value={summary.completed}
                        color="bg-slate-100 text-slate-600"
                    />
                </div>

                {/* Booking Table - Search and Filter are inside this card */}
                <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">

                    {/* Table Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                        <div>
                            <h2 className="text-sm font-semibold text-[#17243b]">
                                Booking Records
                            </h2>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                                View and manage vehicle reservations.
                            </p>
                        </div>

                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                            {filteredBookings.length} Bookings
                        </span>
                    </div>

                    {/* Search and Filters INSIDE table card */}
                    <div className="flex flex-col gap-2 px-4 pb-2 sm:flex-row">
                        <div className="flex min-h-[34px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 focus-within:border-blue-500">
                            <Search size={15} />

                            <input
                                type="text"
                                placeholder="Search booking, customer or vehicle..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full min-w-0 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="min-h-[34px] rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 outline-none focus:border-blue-500 sm:w-40"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="animate-pulse space-y-3 px-4 py-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-5 gap-4"
                                >
                                    {Array.from({ length: 5 }).map((__, i) => (
                                        <div
                                            key={i}
                                            className="h-9 rounded-md bg-slate-100"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : error && bookings.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10">
                            <p className="text-xs text-red-500">{error}</p>

                            <button
                                type="button"
                                onClick={loadData}
                                className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="min-h-0 flex-1">
                            <DataTable
                                columns={columns}
                                data={filteredBookings}
                                pageSize={5}
                                compact
                                emptyMessage="No bookings found"
                            />
                        </div>
                    )}
                </section>
            </div>

            {/* CREATE / EDIT BOOKING */}
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingBooking ? "Edit Booking" : "Create New Booking"}
                size="large"
            >
                <form onSubmit={saveBooking} className="w-full min-w-0">
                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">

                        {/* Customer */}
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>Customer *</label>

                            <select
                                value={form.customerId}
                                onChange={(e) =>
                                    setField("customerId", e.target.value)
                                }
                                required
                                className={inputClass}
                            >
                                <option value="">Select Customer</option>

                                {customers.map((customer) => (
                                    <option
                                        key={customer.id}
                                        value={customer.id}
                                    >
                                        {customer.name || "Customer"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vehicle - name only */}
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>Vehicle *</label>

                            <select
                                value={form.vehicleId}
                                onChange={(e) =>
                                    setField("vehicleId", e.target.value)
                                }
                                required
                                className={inputClass}
                            >
                                <option value="">Select Vehicle</option>

                                {availableVehicles.map((vehicle) => (
                                    <option
                                        key={vehicle.id}
                                        value={vehicle.id}
                                    >
                                        {vehicle.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Auto fetched vehicle information */}
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>
                                Registration Number
                            </label>

                            <input
                                value={selectedVehicle?.number || ""}
                                readOnly
                                placeholder="Auto-filled after vehicle selection"
                                className={`${inputClass} bg-slate-50 text-slate-600`}
                            />
                        </div>

                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>
                                Amount Per Day (₹)
                            </label>

                            <input
                                value={
                                    selectedVehicle
                                        ? money(selectedVehicle.price)
                                        : ""
                                }
                                readOnly
                                placeholder="Auto-filled after vehicle selection"
                                className={`${inputClass} bg-slate-50 font-semibold text-slate-700`}
                            />
                        </div>

                        {/* Pickup date */}
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>Pickup Date *</label>

                            <input
                                type="date"
                                value={form.pickupDate}
                                onChange={(e) =>
                                    setField("pickupDate", e.target.value)
                                }
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Return date */}
                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>Return Date *</label>

                            <input
                                type="date"
                                min={form.pickupDate || undefined}
                                value={form.returnDate}
                                onChange={(e) =>
                                    setField("returnDate", e.target.value)
                                }
                                required
                                className={inputClass}
                            />
                        </div>

                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>Pickup Location</label>

                            <input
                                value={form.pickupLocation}
                                onChange={(e) =>
                                    setField("pickupLocation", e.target.value)
                                }
                                placeholder="Pickup location"
                                className={inputClass}
                            />
                        </div>

                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>Drop-off Location</label>

                            <input
                                value={form.dropoffLocation}
                                onChange={(e) =>
                                    setField("dropoffLocation", e.target.value)
                                }
                                placeholder="Drop-off location"
                                className={inputClass}
                            />
                        </div>

                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>
                                Advance Amount (₹)
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.advanceAmount}
                                onChange={(e) =>
                                    setField("advanceAmount", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="flex min-w-0 flex-col gap-1.5">
                            <label className={labelClass}>Notes</label>

                            <input
                                value={form.notes}
                                onChange={(e) =>
                                    setField("notes", e.target.value)
                                }
                                placeholder="Optional notes"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* PRICE SUMMARY */}
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-blue-100 bg-blue-50/70 p-3">
                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-500">
                                Rental Days
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                {totalDays}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-500">
                                Daily Rate
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {money(dailyRate)}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] text-slate-500">
                                Total Amount
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-blue-700">
                                {money(totalAmount)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-[#3158c9] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                        >
                            {saving
                                ? "Saving..."
                                : editingBooking
                                    ? "Update Booking"
                                    : "Create Booking"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* VIEW BOOKING */}
            <Modal
                isOpen={Boolean(viewingBooking)}
                onClose={closeModal}
                title="Booking Details"
            >
                {viewingBooking && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Booking Reference
                                </p>
                                <p className="mt-1 text-sm font-semibold text-blue-700">
                                    {viewingBooking.bookingId}
                                </p>
                            </div>

                            <StatusBadge status={viewingBooking.status} />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-lg bg-slate-50 p-3">
                                <Users size={16} className="mb-2 text-slate-500" />
                                <p className="text-[10px] text-slate-400">Customer</p>
                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                    {viewingBooking.customerName}
                                </p>
                                <p className="mt-1 break-all text-[10px] text-slate-500">
                                    {viewingBooking.customerEmail}
                                </p>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">
                                <CarFront size={16} className="mb-2 text-slate-500" />
                                <p className="text-[10px] text-slate-400">Vehicle</p>
                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                    {viewingBooking.vehicleName}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-500">
                                    {viewingBooking.vehicleNumber}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <p className="text-slate-400">Pickup Date</p>
                                <p className="mt-1 font-medium text-slate-700">
                                    {dateFormat(viewingBooking.pickupDate)}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400">Return Date</p>
                                <p className="mt-1 font-medium text-slate-700">
                                    {dateFormat(viewingBooking.returnDate)}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400">Rental Days</p>
                                <p className="mt-1 font-medium text-slate-700">
                                    {viewingBooking.totalDays}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400">Daily Rate</p>
                                <p className="mt-1 font-medium text-slate-700">
                                    {money(viewingBooking.dailyRate)}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400">Advance Paid</p>
                                <p className="mt-1 font-medium text-slate-700">
                                    {money(viewingBooking.advanceAmount)}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400">Total Amount</p>
                                <p className="mt-1 font-semibold text-blue-700">
                                    {money(viewingBooking.totalAmount)}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400">Pickup Location</p>
                                <p className="mt-1 font-medium text-slate-700">
                                    {viewingBooking.pickupLocation || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-400">Drop-off Location</p>
                                <p className="mt-1 font-medium text-slate-700">
                                    {viewingBooking.dropoffLocation || "-"}
                                </p>
                            </div>
                        </div>

                        {viewingBooking.notes && (
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-[10px] text-slate-400">Notes</p>
                                <p className="mt-1 text-xs text-slate-700">
                                    {viewingBooking.notes}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* DELETE CONFIRMATION */}
            <Modal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Delete Booking"
            >
                {deleteTarget && (
                    <div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertTriangle size={20} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Are you sure you want to delete this booking?
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {deleteTarget.bookingId} will be permanently removed.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
