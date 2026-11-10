import { Eye, Pencil, Trash2, Plus, Users } from "lucide-react";
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
        isModalOpen,
        editingCustomer,
        viewCustomer,
        setViewCustomer,
        form,
        openAddModal,
        openEditModal,
        closeModal,
        handleChange,
        handleSubmit,
        handleDelete,
    } = useCustomers();

    const columns = [
        {
            key: "name",
            label: "Customer",
            render: (value, customer) => (
                <div>
                    <p className="font-semibold text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
            ),
        },
        {
            key: "phone",
            label: "Phone",
        },
        {
            key: "licenseNumber",
            label: "License Number",
        },
        {
            key: "address",
            label: "Address",
        },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span
                    className={`rounded - full px-3 py-1 text-xs font-semibold ${
value === "Active"
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
render: (_, customer) => (
<div className="flex items-center gap-2">
<button
onClick={() => setViewCustomer(customer)}
className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
title="View"
>
<Eye size={17} />
</button>

<button
onClick={() => openEditModal(customer)}
className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
title="Edit"
>
<Pencil size={17} />
</button>

<button
onClick={() => handleDelete(customer.id)}
className="rounded-lg p-2 text-red-600 hover:bg-red-50"
title="Delete"
>
<Trash2 size={17} />
</button>
</div>
),
},
];

const inputClass =
"w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

return (
<AdminLayout>
<div className="space-y-6">

{/* Page Header */}
<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
<div>
<h1 className="text-2xl font-bold text-gray-800">
Customers
</h1>
<p className="mt-1 text-sm text-gray-500">
Manage your vehicle rental customers.
</p>
</div>

<button
onClick={openAddModal}
className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
>
<Plus size={18} />
Add Customer
</button>
</div>

{/* Summary Cards */}
<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
<div className="rounded-xl border border-gray-200 bg-white p-5">
<div className="flex items-center justify-between">
<p className="text-sm text-gray-500">Total Customers</p>
<Users className="text-blue-600" size={22} />
</div>
<h2 className="mt-3 text-2xl font-bold text-gray-800">
{customers.length}
</h2>
</div>

<div className="rounded-xl border border-gray-200 bg-white p-5">
<p className="text-sm text-gray-500">Active Customers</p>
<h2 className="mt-3 text-2xl font-bold text-green-600">
{activeCount}
</h2>
</div>

<div className="rounded-xl border border-gray-200 bg-white p-5">
<p className="text-sm text-gray-500">Inactive Customers</p>
<h2 className="mt-3 text-2xl font-bold text-gray-600">
{inactiveCount}
</h2>
</div>
</div>

{/* Customer Table */}
<div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
<h2 className="font-semibold text-gray-800">
Customer List
</h2>

<div className="flex flex-col gap-3 sm:flex-row">
<input
type="text"
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Search name, phone or email..."
className={`${inputClass} sm:w-72`
        }
        />

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
            data={filteredCustomers}
            pageSize={5}
            emptyMessage="No customers found."
        />
</div >
</div >

        {/* Add / Edit Customer Modal */ }
        < Modal
    isOpen = { isModalOpen }
    onClose = { closeModal }
    title = { editingCustomer? "Edit Customer": "Add Customer" }
        >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Customer Name
                </label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Enter customer name"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Enter email"
                    />
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Driving License Number
                </label>
                <input
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Enter license number"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address
                </label>
                <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className={inputClass}
                    placeholder="Enter address"
                />
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
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    {editingCustomer ? "Update Customer" : "Save Customer"}
                </button>
            </div>
        </form>
</Modal >

        {/* View Customer Modal */ }
        < Modal
    isOpen = { Boolean(viewCustomer) }
    onClose = {() => setViewCustomer(null)
}
title = "Customer Details"
    >
    { viewCustomer && (
        <div className="space-y-3 text-sm">
            <p><strong>Name:</strong> {viewCustomer.name}</p>
            <p><strong>Phone:</strong> {viewCustomer.phone}</p>
            <p><strong>Email:</strong> {viewCustomer.email}</p>
            <p><strong>License:</strong> {viewCustomer.licenseNumber}</p>
            <p><strong>Address:</strong> {viewCustomer.address}</p>
            <p><strong>Status:</strong> {viewCustomer.status}</p>

            <div className="flex justify-end pt-3">
                <button
                    onClick={() => setViewCustomer(null)}
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

export default Customers;
