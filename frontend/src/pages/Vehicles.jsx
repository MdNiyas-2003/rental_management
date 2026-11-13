import {
    Car,
    CarFront,
    CheckCircle,
    Wrench,
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    X,
    Check,
    AlertCircle,
    RefreshCw,
    LoaderCircle,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import useVehicles from "../hooks/useVehicles";

// Shimmer loading rows
function VehicleTableSkeleton() {
    return (
        <div className="w-full animate-pulse">
            <div className="grid grid-cols-7 gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
                {["Vehicle", "Registration", "Fuel", "Seats", "Price", "Status", "Actions"].map((item) => (
                    <div key={item} className="h-2.5 rounded bg-slate-200" />
                ))}
            </div>

            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="grid grid-cols-7 items-center gap-4 border-b border-slate-100 px-4 py-3"
                >
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-slate-200" />
                        <div className="flex-1 space-y-2">
                            <div className="h-2.5 w-24 rounded bg-slate-200" />
                            <div className="h-2 w-12 rounded bg-slate-100" />
                        </div>
                    </div>

                    <div className="h-2.5 w-24 rounded bg-slate-200" />
                    <div className="h-2.5 w-12 rounded bg-slate-200" />
                    <div className="h-2.5 w-6 rounded bg-slate-200" />
                    <div className="h-2.5 w-14 rounded bg-slate-200" />
                    <div className="h-5 w-16 rounded-full bg-slate-200" />

                    <div className="flex gap-1.5">
                        <div className="h-6 w-6 rounded bg-slate-200" />
                        <div className="h-6 w-6 rounded bg-slate-200" />
                        <div className="h-6 w-6 rounded bg-slate-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Compact top-right Snackbar
function VehicleSnackbar({ notification, onClose }) {
    if (!notification) return null;

    const isError = notification.type === "error";

    return (
        <div
            role="alert"
            className={`fixed right-6 top-20 z-[2000] flex w-[340px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-lg border px-4 py-3 shadow-xl ${isError
                    ? "border-red-300 bg-red-100"
                    : "border-green-300 bg-green-100"
                }`}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isError ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"}`}
                >
                {isError ? (
                    <AlertCircle size={20} />
                ) : (
                    <CheckCircle size={20} />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className={`text-sm font-semibold ${isError ? "text-red-700" : "text-green-700"}`}
                >
                    {isError ? "Operation Failed" : "Success"}
                </p>

                <p className="mt-0.5 break-words text-[13px] font-medium text-slate-600">
                    {notification.message}
                </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
}

function Vehicles() {
    const {
        vehicles,
        filteredVehicles,
        search,
        setSearch,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        availableCount,
        rentedCount,
        maintenanceCount,
        loading,
        saving,
        error,
        fetchVehicles,
        notification,
        dismissNotification,
        isModalOpen,
        editingVehicle,
        viewVehicle,
        setViewVehicle,
        form,
        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleDelete,
        confirmDelete,
        cancelDelete,
        deleteVehicle,
        deleting,
    } = useVehicles();

    const columns = [
        {
            key: "name",
            label: "Vehicle",
            render: (value, vehicle) => (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                        <CarFront size={17} />
                    </div>
                    <div>
                        <strong className="block text-xs font-semibold text-slate-700">
                            {value}
                        </strong>
                        <span className="mt-0.5 block text-[10px] text-slate-400">
                            {vehicle.category}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "number",
            label: "Registration No.",
        },
        {
            key: "fuel",
            label: "Fuel",
        },
        {
            key: "seats",
            label: "Seats",
        },
        {
            key: "price",
            label: "Price / Day",
            render: (value) =>
                `₹${Number(value).toLocaleString("en-IN")}`,
        },
        {
            key: "status",
            label: "Status",
            render: (value) => {
                const styles = {
                    Available: "bg-green-50 text-green-700",
                    Rented: "bg-orange-50 text-orange-700",
                    Maintenance: "bg-red-50 text-red-600",
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
            key: "id",
            label: "Actions",
            render: (_, vehicle) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        title="View"
                        onClick={() => setViewVehicle(vehicle)}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Eye size={14} />
                    </button>

                    <button
                        type="button"
                        title="Edit"
                        onClick={() => openEditModal(vehicle)}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Pencil size={14} />
                    </button>

                    <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(vehicle)}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ];

    const summaryCards = [
        {
            title: "Total Vehicles",
            value: vehicles.length,
            icon: Car,
            style: "bg-blue-50 text-blue-600",
        },
        {
            title: "Available",
            value: availableCount,
            icon: CheckCircle,
            style: "bg-green-50 text-green-600",
        },
        {
            title: "Rented",
            value: rentedCount,
            icon: CarFront,
            style: "bg-orange-50 text-orange-600",
        },
        {
            title: "Maintenance",
            value: maintenanceCount,
            icon: Wrench,
            style: "bg-red-50 text-red-600",
        },
    ];

    const inputClass =
        "min-h-[36px] w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const labelClass = "text-[11px] font-semibold text-slate-600";

    return (
        <AdminLayout>
            <VehicleSnackbar
                notification={notification}
                onClose={dismissNotification}
            />

            <div className="mx-auto flex min-h-[calc(100dvh-135px)] w-full max-w-[1600px] flex-col gap-2">

                {/* Heading */}
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-[#17243b]">Vehicles</h1>
                        <p className="mt-0.5 text-xs text-slate-500">Manage your rental fleet and vehicle details.</p>
                    </div>
                    <div className="flex w-full justify-end sm:w-auto">
                        <button type="button" onClick={openAddModal}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#3158c9] px-4 text-xs font-semibold text-white transition hover:bg-blue-800">
                            <Plus size={15} /> Add Vehicle
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {summaryCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="flex min-h-[60px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                            >
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md${item.style}`
                                    }
                                >
                                    <Icon size={16} />
                                </div >

                                <span className="min-w-0 text-[11px] font-medium text-slate-500">
                                    {item.title}
                                </span>

                                <strong className="ml-auto text-lg font-bold leading-none text-[#17243b] tabular-nums">
                                    {loading ? "—" : item.value}
                                </strong>
                            </div >
                        );
                    })}
                </div >

                {/* Vehicle Table */}
                < section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white" >

                    {/* Table Heading */}
                    < div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2" >
                        <div>
                            <h2 className="text-sm font-semibold text-[#17243b]">
                                All Vehicles
                            </h2>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                                View and manage your registered vehicles.
                            </p>
                        </div>

                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                            {loading ? "Loading..." : `${filteredVehicles.length} Vehicles`}
                        </span>
                    </div >

                    {/* Search and Filters */}
                    < div className="flex flex-col gap-2 px-4 pb-2 sm:flex-row" >
                        <div className="flex min-h-[34px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 focus-within:border-blue-500">
                            <Search size={15} />

                            <input
                                type="text"
                                placeholder="Search vehicle or registration number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="min-h-[34px] rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 outline-none focus:border-blue-500"
                        >
                            <option value="All">All Categories</option>
                            <option value="SUV">SUV</option>
                            <option value="Sedan">Sedan</option>
                            <option value="Hatchback">Hatchback</option>
                            <option value="MUV">MUV</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="min-h-[34px] rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 outline-none focus:border-blue-500"
                        >
                            <option value="All">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Rented">Rented</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                    </div >

                    {/* Loading / Error / Data */}
                    < div className="flex-1" >
                        {
                            loading ? (
                                <VehicleTableSkeleton />
                            ) : error && vehicles.length === 0 ? (
                                <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 text-center">
                                    <AlertCircle size={28} className="text-red-400" />

                                    <p className="text-sm font-semibold text-slate-700">
                                        Unable to load vehicles
                                    </p>

                                    <p className="max-w-sm text-xs text-slate-400">
                                        {error}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={fetchVehicles}
                                        className="mt-1 flex items-center gap-1.5 rounded-lg bg-[#3158c9] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                                    >
                                        <RefreshCw size={13} />
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={filteredVehicles}
                                    pageSize={5}
                                    compact
                                    emptyMessage="No vehicles found"
                                />
                            )}
                    </div >
                </section >

                {/* Add / Edit Modal */}
                < Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                    size="large"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Vehicle Name *</label>
                                <input
                                    className={inputClass}
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Toyota Innova"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Registration Number *</label>
                                <input
                                    className={inputClass}
                                    name="number"
                                    value={form.number}
                                    onChange={handleChange}
                                    placeholder="e.g. TN 01 AB 1234"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Category</label>
                                <select
                                    className={inputClass}
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                >
                                    <option value="SUV">SUV</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="Hatchback">Hatchback</option>
                                    <option value="MUV">MUV</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Fuel Type</label>
                                <select
                                    className={inputClass}
                                    name="fuel"
                                    value={form.fuel}
                                    onChange={handleChange}
                                >
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Seating Capacity</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    name="seats"
                                    min="1"
                                    value={form.seats}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Price Per Day (₹) *</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    name="price"
                                    min="1"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="Enter daily price"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <label className={labelClass}>Vehicle Status</label>
                                <select
                                    className={inputClass}
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="Available">Available</option>
                                    <option value="Rented">Rented</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg bg-[#3158c9] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving && (
                                    <LoaderCircle size={13} className="animate-spin" />
                                )}
                                {saving
                                    ? "Saving..."
                                    : editingVehicle
                                        ? "Update Vehicle"
                                        : "Save Vehicle"}
                            </button>
                        </div>
                    </form>
                </Modal >

                {/* Delete Confirmation Modal */}
                < Modal
                    isOpen={Boolean(deleteVehicle)}
                    onClose={cancelDelete}
                    title="Delete Vehicle"
                >
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <Trash2 size={17} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Are you sure you want to delete this vehicle?
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {deleteVehicle?.name} ({deleteVehicle?.number}) will be permanently removed.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                disabled={deleting}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </Modal >

                {/* View Details Modal */}
                < Modal
                    isOpen={Boolean(viewVehicle)}
                    onClose={() => setViewVehicle(null)}
                    title="Vehicle Details"
                >
                    {viewVehicle && (
                        <div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {[
                                    ["Vehicle Name", viewVehicle.name],
                                    ["Registration Number", viewVehicle.number],
                                    ["Category", viewVehicle.category],
                                    ["Fuel", viewVehicle.fuel],
                                    ["Seats", viewVehicle.seats],
                                    [
                                        "Price Per Day",
                                        `₹${Number(viewVehicle.price).toLocaleString("en-IN")}`,
                                    ],
                                    ["Status", viewVehicle.status],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex flex-col gap-1">
                                        <span className="text-[11px] text-slate-400">
                                            {label}
                                        </span>
                                        <strong className="text-sm text-slate-700">
                                            {value}
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setViewVehicle(null)}
                                    className="rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-600 hover:bg-slate-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </Modal >

            </div >
        </AdminLayout >
    );
}

export default Vehicles;