import {
    Eye,
    Pencil,
    Trash2,
    Plus,
    CheckCircle,
    CalendarDays,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import useBookings from "../hooks/useBookings";

function Bookings() {
    const {
        bookings,
        filteredBookings,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        paymentFilter,
        setPaymentFilter,
        totalCount,
        pendingCount,
        confirmedCount,
        activeCount,
        cancellationCount,
        isModalOpen,
        editingBooking,
        viewBooking,
        setViewBooking,
        form,
        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleDelete,
        approveCancellation,
    } = useBookings();

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const statusStyle = {
        Pending: "bg-amber-100 text-amber-700",
        Confirmed: "bg-blue-100 text-blue-700",
        Active: "bg-green-100 text-green-700",
        Completed: "bg-gray-100 text-gray-700",
        "Cancellation Requested": "bg-orange-100 text-orange-700",
        Cancelled: "bg-red-100 text-red-700",
    };

    const columns = [
        {
            key: "bookingId",
            label: "Booking ID",
            render: (value) => (
                <span className="font-semibold text-blue-600">{value}</span>
            ),
        },
        {
            key: "customer",
            label: "Customer",
        },
        {
            key: "vehicle",
            label: "Vehicle",
            render: (value, booking) => (
                <div>
                    <p className="font-medium text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">
                        {booking.registrationNumber}
                    </p>
                </div>
            ),
        },
        {
            key: "pickupDate",
            label: "Rental Period",
            render: (value, booking) => (
                <div className="text-xs">
                    <p>{value}</p>
                    <p className="text-gray-500">to {booking.returnDate}</p>
                </div>
            ),
        },
        {
            key: "totalAmount",
            label: "Amount",
            render: (value) => (
                <span className="font-semibold text-gray-800">
                    ₹{Number(value).toLocaleString("en-IN")}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span
                    className={`inline - block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[value] || "bg-gray-100 text-gray-700"
                        }`} >{value} </span>),
        }, {
            key: "paymentStatus",
            label: "Payment",
            render: (value) => (<span className={`text- xs font - semibold ${value === "Paid" ? "text-green-600" : "text-red-600"}`}
            >
                {value}
            </span >
            ),
        },
        {
            key: "id",
            label: "Actions",
            render: (_, booking) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewBooking(booking)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="View"
                    >
                        <Eye size={17} />
                    </button>

                    {booking.status !== "Completed" &&
                        booking.status !== "Cancelled" && (
                            <button
                                onClick={() => openEditModal(booking)}
                                className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                                title="Edit"
                            >
                                <Pencil size={17} />
                            </button>
                        )}

                    {booking.status === "Cancellation Requested" && (
                        <button
                            onClick={() => approveCancellation(booking.id)}
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                            title="Approve cancellation"
                        >
                            <CheckCircle size={17} />
                        </button>
                    )}

                    <button
                        onClick={() => handleDelete(booking.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Bookings
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage vehicle reservations and rental operations.
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Create Booking
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">Total Bookings</p>
                        <h2 className="mt-2 text-2xl font-bold text-gray-800">
                            {totalCount}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">Pending</p>
                        <h2 className="mt-2 text-2xl font-bold text-amber-600">
                            {pendingCount}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">Confirmed</p>
                        <h2 className="mt-2 text-2xl font-bold text-blue-600">
                            {confirmedCount}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">Active Rentals</p>
                        <h2 className="mt-2 text-2xl font-bold text-green-600">
                            {activeCount}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm text-gray-500">Cancellation Requests</p>
                        <h2 className="mt-2 text-2xl font-bold text-orange-600">
                            {cancellationCount}
                        </h2>
                    </div>
                </div>

                {/* Booking Table */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                    <div className="mb-5 space-y-4">
                        <div>
                            <h2 className="font-semibold text-gray-800">
                                Booking List
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                View and manage all vehicle bookings.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search booking, customer or vehicle..."
                                className={inputClass}
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={inputClass}
                            >
                                <option value="All">All Booking Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancellation Requested">
                                    Cancellation Requested
                                </option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className={inputClass}
                            >
                                <option value="All">All Payment Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                            </select>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredBookings}
                        pageSize={5}
                        emptyMessage="No bookings found."
                    />
                </div>
            </div>

            {/* Add / Edit Booking Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingBooking ? "Edit Booking" : "Create Booking"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Customer Name
                        </label>
                        <input
                            name="customer"
                            value={form.customer}
                            onChange={handleChange}
                            required
                            className={inputClass}
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Vehicle Name
                            </label>
                            <input
                                name="vehicle"
                                value={form.vehicle}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder="Enter vehicle name"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Registration Number
                            </label>
                            <input
                                name="registrationNumber"
                                value={form.registrationNumber}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder="TN 01 AB 1234"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Pickup Date
                            </label>
                            <input
                                type="date"
                                name="pickupDate"
                                value={form.pickupDate}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Return Date
                            </label>
                            <input
                                type="date"
                                name="returnDate"
                                value={form.returnDate}
                                onChange={handleChange}
                                required
                                min={form.pickupDate || undefined}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Total Amount (₹)
                        </label>
                        <input
                            type="number"
                            name="totalAmount"
                            value={form.totalAmount}
                            onChange={handleChange}
                            required
                            min="0"
                            className={inputClass}
                            placeholder="Enter total amount"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Booking Status
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancellation Requested">
                                    Cancellation Requested
                                </option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Payment Status
                            </label>
                            <select
                                name="paymentStatus"
                                value={form.paymentStatus}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            {editingBooking ? "Update Booking" : "Save Booking"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Booking Modal */}
            <Modal
                isOpen={Boolean(viewBooking)}
                onClose={() => setViewBooking(null)}
                title="Booking Details"
            >
                {viewBooking && (
                    <div className="space-y-3 text-sm">
                        <p><strong>Booking ID:</strong> {viewBooking.bookingId}</p>
                        <p><strong>Customer:</strong> {viewBooking.customer}</p>
                        <p><strong>Vehicle:</strong> {viewBooking.vehicle}</p>
                        <p><strong>Registration:</strong> {viewBooking.registrationNumber}</p>
                        <p><strong>Pickup:</strong> {viewBooking.pickupDate}</p>
                        <p><strong>Return:</strong> {viewBooking.returnDate}</p>
                        <p><strong>Rental Days:</strong> {viewBooking.totalDays}</p>
                        <p>
                            <strong>Total Amount:</strong>{" "}
                            ₹{Number(viewBooking.totalAmount).toLocaleString("en-IN")}
                        </p>
                        <p><strong>Booking Status:</strong> {viewBooking.status}</p>
                        <p><strong>Payment Status:</strong> {viewBooking.paymentStatus}</p>

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={() => setViewBooking(null)}
                                className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}

export default Bookings;
