import {
    Eye,
    Pencil,
    Trash2,
    Plus,
    Users,
    UserCheck,
    UserX,
    Search,
    X,
    AlertTriangle,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import useCustomers from "../hooks/useCustomers";

function Customers() {
    const {
        customers,
        filteredCustomers,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        activeCount,
        inactiveCount,
        loading,
        saving,
        deleting,
        error,
        notification,
        dismissNotification,
        isModalOpen,
        editingCustomer,
        viewCustomer,
        setViewCustomer,
        deleteCustomer,
        form,
        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleDelete,
        confirmDelete,
        cancelDelete,
    } = useCustomers();

    const columns = [
        {
            key: "name",
            label: "Customer",
            render: (value, customer) => (
                <div>
                    <p className="text-xs font-semibold text-slate-700">
                        {value}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                        {customer.email}
                    </p>
                </div>
            ),
        },
        {
            key: "phone",
            label: "Phone",
            render: (value) => (
                <span className="text-xs text-slate-600">
                    {value || "—"}
                </span>
            ),
        },
        {
            key: "licenseNumber",
            label: "License Number",
            render: (value) => (
                <span className="text-xs text-slate-600">
                    {value || "—"}
                </span>
            ),
        },
        {
            key: "address",
            label: "Address",
            render: (value) => (
                <span className="text-xs text-slate-600">
                    {value || "—"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${value === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                >
                    {value}
                </span>
            ),
        },
        {
            key: "id",
            label: "Actions",
            render: (_, customer) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        title="View"
                        onClick={() => setViewCustomer(customer)}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Eye size={14} />
                    </button>

                    <button
                        type="button"
                        title="Edit"
                        onClick={() => openEditModal(customer)}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Pencil size={14} />
                    </button>

                    <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(customer)}
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
            title: "Total Customers",
            value: customers.length,
            icon: Users,
            style: "bg-blue-50 text-blue-600",
        },
        {
            title: "Active Customers",
            value: activeCount,
            icon: UserCheck,
            style: "bg-green-50 text-green-600",
        },
        {
            title: "Inactive Customers",
            value: inactiveCount,
            icon: UserX,
            style: "bg-slate-100 text-slate-600",
        },
    ];

    const inputClass =
        "min-h-[36px] w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    const labelClass =
        "text-[11px] font-semibold text-slate-600";

    return (
        <AdminLayout>
            <div className="mx-auto flex min-h-[calc(100dvh-135px)] w-full max-w-[1600px] flex-col gap-2">

                {/* Notification */}
                {notification && (
                    <div
                        className={`fixed right-5 top-20 z-[100] flex w-[340px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-lg border p-3 shadow-lg${notification.type === "error"
                                ? "border-red-200 bg-red-50"
                                : "border-green-200 bg-green-50"
                            }`} >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                        >
                            {notification.type === "error" ? (
                                <AlertTriangle size={17} />
                            ) : (
                                <UserCheck size={17} />
                            )}
                        </div>

                        <p
                            className={`flex-1 text-xs font-medium${notification.type === "error"
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-bold text-[#17243b]">
                            Customers
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Manage your vehicle rental customers.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#3158c9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                    >
                        <Plus size={15} />
                        Add Customer
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                    {summaryCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="flex min-h-[60px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                            >
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${item.style}`}
                                >
                                    <Icon size={16} />
                                </div>

                                <span className="min-w-0 text-[11px] font-medium text-slate-500">
                                    {item.title}
                                </span>

                                <strong className="ml-auto text-lg font-bold leading-none text-[#17243b] tabular-nums">
                                    {item.value}
                                </strong>
                            </div>
                        );
                    })}
                </div>

                {/* Customer Table */}
                <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">

                    {/* Table Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                        <div>
                            <h2 className="text-sm font-semibold text-[#17243b]">
                                All Customers
                            </h2>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                                View and manage your registered customers.
                            </p>
                        </div>

                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                            {filteredCustomers.length} Customers
                        </span>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-2 px-4 pb-2 sm:flex-row">
                        <div className="flex min-h-[34px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 focus-within:border-blue-500">
                            <Search size={15} />

                            <input
                                type="text"
                                placeholder="Search customer, phone or email..."
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
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Loading Skeleton */}
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
                    ) : error && customers.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10">
                            <p className="text-xs text-red-500">{error}</p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1">
                            <DataTable
                                columns={columns}
                                data={filteredCustomers}
                                pageSize={5}
                                compact
                                emptyMessage="No customers found"
                            />
                        </div>
                    )}
                </section>
            </div>

            {/* Add / Edit Customer Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={
                    editingCustomer
                        ? "Edit Customer"
                        : "Add New Customer"
                }
                size="large"
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>
                                Customer Name *
                            </label>
                            <input
                                className={inputClass}
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter customer name"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>
                                Phone Number
                            </label>
                            <input
                                className={inputClass}
                                name="phone"
                                value={form.phone || ""}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Email *</label>
                            <input
                                className={inputClass}
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>
                                {editingCustomer
                                    ? "New Password (Optional)"
                                    : "Password *"}
                            </label>
                            <input
                                className={inputClass}
                                name="password"
                                type="password"
                                value={form.password || ""}
                                onChange={handleChange}
                                placeholder={
                                    editingCustomer
                                        ? "Leave blank to keep current password"
                                        : "Minimum 8 characters"
                                }
                                minLength={8}
                                required={!editingCustomer}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className={labelClass}>
                                Driving License Number
                            </label>
                            <input
                                className={inputClass}
                                name="licenseNumber"
                                value={form.licenseNumber || ""}
                                onChange={handleChange}
                                placeholder="Enter driving license number"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className={labelClass}>Address</label>
                            <textarea
                                name="address"
                                value={form.address || ""}
                                onChange={handleChange}
                                rows={2}
                                className={inputClass}
                                placeholder="Enter address"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className={labelClass}>Status</label>
                            <select
                                name="status"
                                value={form.status || "Active"}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-3 text-xs text-red-500">
                            {error}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={saving}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-[#3158c9] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Saving..." : editingCustomer ? "Update Customer" : "Save Customer"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Customer Modal */}
            <Modal
                isOpen={Boolean(viewCustomer)}
                onClose={() => setViewCustomer(null)}
                title="Customer Details"
            >
                {viewCustomer && (
                    <div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                ["Customer Name", viewCustomer.name],
                                ["Phone Number", viewCustomer.phone],
                                ["Email", viewCustomer.email],
                                ["License Number", viewCustomer.licenseNumber],
                                ["Address", viewCustomer.address],
                                ["Status", viewCustomer.status],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex flex-col gap-1"
                                >
                                    <span className="text-[11px] text-slate-400">
                                        {label}
                                    </span>
                                    <strong className="text-sm text-slate-700">
                                        {value || "—"}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setViewCustomer(null)}
                                className="rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-600 hover:bg-slate-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={Boolean(deleteCustomer)}
                onClose={cancelDelete}
                title="Delete Customer"
            >
                {deleteCustomer && (
                    <div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertTriangle size={20} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Are you sure you want to delete this customer?
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {deleteCustomer.name} will be permanently removed.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
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
                                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}

export default Customers;