import {
    Eye,
    Pencil,
    Trash2,
    Plus,
    Users,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import useStaff from "../hooks/useStaff";

function Staff() {
    const {
        staff,
        filteredStaff,
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        activeCount,
        inactiveCount,
        isModalOpen,
        editingStaff,
        viewStaff,
        setViewStaff,
        form,
        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleDelete,
    } = useStaff();

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const columns = [
        {
            key: "name",
            label: "Employee",
            render: (value, employee) => (
                <div>
                    <p className="font-semibold text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">
                        {employee.employeeId}
                    </p>
                </div>
            ),
        },
        {
            key: "phone",
            label: "Phone",
        },
        {
            key: "email",
            label: "Email",
        },
        {
            key: "role",
            label: "Role",
        },
        {
            key: "department",
            label: "Department",
        },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span
                    className={`rounded - full px-3 py-1 text-xs font-semibold ${value === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {value}
                </span>
            ),
        },
        {
            key: "id",
            label: "Actions",
            render: (_, employee) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewStaff(employee)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="View"
                    >
                        <Eye size={17} />
                    </button>

                    <button
                        onClick={() => openEditModal(employee)}
                        className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                        title="Edit"
                    >
                        <Pencil size={17} />
                    </button>

                    <button
                        onClick={() => handleDelete(employee.id)}
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

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Staff Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage employees, roles and staff information.
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Staff
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Total Staff</p>
                            <Users size={22} className="text-blue-600" />
                        </div>
                        <h2 className="mt-3 text-2xl font-bold text-gray-800">
                            {staff.length}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <p className="text-sm text-gray-500">Active Staff</p>
                        <h2 className="mt-3 text-2xl font-bold text-green-600">
                            {activeCount}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <p className="text-sm text-gray-500">Inactive Staff</p>
                        <h2 className="mt-3 text-2xl font-bold text-gray-600">
                            {inactiveCount}
                        </h2>
                    </div>
                </div>

                {/* Staff Table */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-semibold text-gray-800">
                            Staff List
                        </h2>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search staff..."
                                className={`${inputClass} sm:w-64`
                                }
                            />

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className={inputClass}
                            >
                                <option value="All">All Roles</option>
                                <option value="Manager">Manager</option>
                                <option value="Rental Executive">Rental Executive</option>
                                <option value="Vehicle Inspector">Vehicle Inspector</option>
                                <option value="Accountant">Accountant</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={inputClass}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div >
                    </div >

                    <DataTable
                        columns={columns}
                        data={filteredStaff}
                        pageSize={5}
                        emptyMessage="No staff members found."
                    />
                </div >
            </div >

            {/* Add / Edit Staff Modal */}
            < Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingStaff ? "Edit Staff" : "Add Staff"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Employee Name
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className={inputClass}
                            placeholder="Enter employee name"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Employee ID
                            </label>
                            <input
                                name="employeeId"
                                value={form.employeeId}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder="EMP-1006"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className={inputClass}
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Manager">Manager</option>
                                <option value="Rental Executive">Rental Executive</option>
                                <option value="Vehicle Inspector">Vehicle Inspector</option>
                                <option value="Accountant">Accountant</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Department
                            </label>
                            <select
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Operations">Operations</option>
                                <option value="Bookings">Bookings</option>
                                <option value="Finance">Finance</option>
                                <option value="Administration">Administration</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
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
                            {editingStaff ? "Update Staff" : "Save Staff"}
                        </button>
                    </div>
                </form>
            </Modal >

            {/* View Staff Modal */}
            < Modal
                isOpen={Boolean(viewStaff)}
                onClose={() => setViewStaff(null)
                }
                title="Staff Details"
            >
                {viewStaff && (
                    <div className="space-y-3 text-sm">
                        <p><strong>Name:</strong> {viewStaff.name}</p>
                        <p><strong>Employee ID:</strong> {viewStaff.employeeId}</p>
                        <p><strong>Phone:</strong> {viewStaff.phone}</p>
                        <p><strong>Email:</strong> {viewStaff.email}</p>
                        <p><strong>Role:</strong> {viewStaff.role}</p>
                        <p><strong>Department:</strong> {viewStaff.department}</p>
                        <p><strong>Status:</strong> {viewStaff.status}</p>

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={() => setViewStaff(null)}
                                className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal >
        </AdminLayout >
    );
}

export default Staff;
