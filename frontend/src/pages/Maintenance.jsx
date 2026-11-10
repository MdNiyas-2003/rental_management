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
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import useMaintenance from "../hooks/useMaintenance";
import {
    maintenanceServiceTypes,
    maintenanceStatuses,
} from "../data/maintenanceData";

const inputClass =
    "h-9 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500";

const labelClass =
    "mb-1 block text-xs font-medium text-gray-600";

function SummaryCard({ title, value, icon: Icon, color }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{title}</p>
                <div className={`rounded-md p-2 ${color}`}>
                    <Icon size={18} />
                </div>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-gray-800">
                {value}
            </h3>
        </div>
    );
}

export default function Maintenance() {
    const {
        filteredRecords,
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
        deleteMaintenance,
    } = useMaintenance();

    const columns = [
        {
            key: "maintenanceId",
            label: "Maintenance ID",
            render: (value) => (
                <span className="font-medium text-blue-600">{value}</span>
            ),
        },
        { key: "vehicle", label: "Vehicle" },
        { key: "registrationNumber", label: "Registration No." },
        { key: "serviceType", label: "Service Type" },
        { key: "serviceDate", label: "Service Date" },
        {
            key: "cost",
            label: "Cost",
            render: (value) => `₹${Number(value).toLocaleString("en-IN")}`,
        },
        {
            key: "status",
            label: "Status",
            render: (value) => {
                const colors = {
                    Scheduled: "bg-blue-100 text-blue-700",
                    "In Progress": "bg-amber-100 text-amber-700",
                    Completed: "bg-green-100 text-green-700",
                };

                return (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[value] || "bg-gray-100 text-gray-600"
                            }`}
                    >
                        {value}
                    </span >
                );
            },
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openViewModal(row)}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                        title="View"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => openEditModal(row)}
                        className="rounded p-1.5 text-amber-600 hover:bg-amber-50"
                        title="Edit"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => deleteMaintenance(row.id)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const isView = modalMode === "view";

    const formFields = [
        {
            name: "vehicle",
            label: "Vehicle Name",
            type: "text",
            required: true,
        },
        {
            name: "registrationNumber",
            label: "Registration Number",
            type: "text",
            required: true,
        },
        {
            name: "serviceDate",
            label: "Service Date",
            type: "date",
            required: true,
        },
        {
            name: "nextServiceDate",
            label: "Next Service Date",
            type: "date",
        },
        {
            name: "odometer",
            label: "Odometer Reading (KM)",
            type: "number",
            required: true,
        },
        {
            name: "serviceProvider",
            label: "Service Provider",
            type: "text",
            required: true,
        },
        {
            name: "cost",
            label: "Service Cost (₹)",
            type: "number",
            required: true,
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-5 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">
                            Vehicle Maintenance
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage vehicle services, repairs and maintenance history.
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Add Maintenance
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <SummaryCard
                        title="Total Records"
                        value={totalRecords}
                        icon={Wrench}
                        color="bg-blue-50 text-blue-600"
                    />
                    <SummaryCard
                        title="Scheduled"
                        value={scheduledCount}
                        icon={CalendarDays}
                        color="bg-blue-50 text-blue-600"
                    />
                    <SummaryCard
                        title="In Progress"
                        value={inProgressCount}
                        icon={Clock}
                        color="bg-amber-50 text-amber-600"
                    />
                    <SummaryCard
                        title="Completed"
                        value={completedCount}
                        icon={CheckCircle}
                        color="bg-green-50 text-green-600"
                    />
                    <SummaryCard
                        title="Total Cost"
                        value={`₹${totalCost.toLocaleString("en-IN")}`}
                        icon={IndianRupee}
                        color="bg-purple-50 text-purple-600"
                    />
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <div className="relative min-w-48 flex-1">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search vehicle or maintenance ID..."
                                className={`${inputClass} pl-9`}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`${inputClass} w-auto min-w-36`}
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
                            className={`${inputClass} w-auto min-w-40`}
                        >
                            <option value="All">All Services</option>
                            {maintenanceServiceTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredRecords}
                        emptyMessage="No maintenance records found."
                    />
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={
                        isView
                            ? "Maintenance Details"
                            : modalMode === "edit"
                                ? "Edit Maintenance"
                                : "Add Maintenance"
                    }
                >
                    {isView ? (
                        <div className="space-y-4">
                            {selectedRecord && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {[
                                        ["Maintenance ID", selectedRecord.maintenanceId],
                                        ["Vehicle", selectedRecord.vehicle],
                                        ["Registration", selectedRecord.registrationNumber],
                                        ["Service Type", selectedRecord.serviceType],
                                        ["Service Date", selectedRecord.serviceDate],
                                        ["Next Service", selectedRecord.nextServiceDate || "-"],
                                        ["Odometer", `${selectedRecord.odometer} KM], ["Provider", selectedRecord.serviceProvider], [ "Cost",₹${Number(selectedRecord.cost).toLocaleString("en-IN")}`,
                                        ],
                                        ["Status", selectedRecord.status],
                                        ["Description", selectedRecord.description || "-"],
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-md bg-gray-50 p-3">
                                            <p className="text-xs text-gray-500">{label}</p>
                                            <p className="mt-1 text-sm font-medium text-gray-800">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={submitMaintenance} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {formFields.map((field) => (
                                    <div key={field.name}>
                                        <label className={labelClass}>
                                            {field.label}
                                            {field.required && " *"}
                                        </label>
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            min={field.type === "number" ? 0 : undefined}
                                            value={form[field.name] ?? ""}
                                            onChange={(e) =>
                                                handleChange(field.name, e.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label className={labelClass}>Service Type</label>
                                    <select
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

                                <div>
                                    <label className={labelClass}>Status</label>
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

                                <div className="sm:col-span-2">
                                    <label className={labelClass}>Description / Notes</label>
                                    <textarea
                                        rows={2}
                                        value={form.description}
                                        onChange={(e) =>
                                            handleChange("description", e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex h-9 items-center gap-1 rounded-md border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    <X size={15} />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    {modalMode === "edit" ? "Update Record" : "Save Record"}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>
            </div >
        </AdminLayout >
    );
}