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
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import useVehicles from "../hooks/useVehicles";

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
    } = useVehicles();

    const columns = [
        {
            key: "name",
            label: "Vehicle",
            render: (value, vehicle) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CarFront size={21} />
                    </div>
                    <div>
                        <strong className="block text-xs font-semibold text-slate-700">
                            {value}
                        </strong>
                        <span className="mt-1 block text-[11px] text-slate-400">
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
            render: (value) => `₹${Number(value).toLocaleString("en-IN")}`,
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
                        className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold${styles[value] || "bg-slate-100 text-slate-600"
                            }`}
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
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        title="View"
                        onClick={() => setViewVehicle(vehicle)}
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Eye size={16} />
                    </button>

                    <button
                        type="button"
                        title="Edit"
                        onClick={() => openEditModal(vehicle)}
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(vehicle.id)}
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={16} />
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
        "min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const labelClass = "text-xs font-semibold text-slate-600";

    return (
        <AdminLayout>
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">

                {/* Heading */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#17243b]">
                            Vehicles
                        </h1>
                        <p className="mt-2 text-[13px] text-slate-500">
                            Manage your rental fleet and vehicle details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#3158c9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                        <Plus size={19} />
                        Add Vehicle
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                    {summaryCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                            >
                                <div
                                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${item.style}`}
                                >
                                    <Icon size={21} />
                                </div>

                                <span className="text-xs text-slate-500">
                                    {item.title}
                                </span>

                                <h2 className="mt-2 text-2xl font-bold text-[#17243b]">
                                    {item.value}
                                </h2>
                            </div>
                        );
                    })}
                </div>

                {/* Vehicle Table */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                    <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                        <div>
                            <h2 className="text-[17px] font-semibold text-[#17243b]">
                                All Vehicles
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">
                                View and manage your registered vehicles.
                            </p>
                        </div>

                        <span className="rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                            {filteredVehicles.length} Vehicles
                        </span>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-3 px-5 pb-5 sm:flex-row">
                        <div className="flex min-h-[42px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 focus-within:border-blue-500">
                            <Search size={18} />

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
                            className="min-h-[42px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-500"
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
                            className="min-h-[42px] rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-500"
                        >
                            <option value="All">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Rented">Rented</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredVehicles}
                        pageSize={5}
                        emptyMessage="No vehicles found"
                    />
                </section>

                {/* Add / Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                    size="large"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <div className="flex flex-col gap-2">
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

                            <div className="flex flex-col gap-2">
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

                            <div className="flex flex-col gap-2">
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

                            <div className="flex flex-col gap-2">
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

                            <div className="flex flex-col gap-2">
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

                            <div className="flex flex-col gap-2">
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

                        <div className="mt-7 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="rounded-lg bg-[#3158c9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                            >
                                {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* View Details Modal */}
                <Modal
                    isOpen={Boolean(viewVehicle)}
                    onClose={() => setViewVehicle(null)}
                    title="Vehicle Details"
                >
                    {viewVehicle && (
                        <div>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                                    <div key={label} className="flex flex-col gap-1.5">
                                        <span className="text-[11px] text-slate-400">
                                            {label}
                                        </span>
                                        <strong className="text-sm text-slate-700">
                                            {value}
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setViewVehicle(null)}
                                    className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

            </div>
        </AdminLayout>
    );
}

export default Vehicles;
