import {
    TrendingUp,
    TrendingDown,
    Clock,
    Eye,
} from "lucide-react";

import AdminLayout from "../layouts/AdminLayout";
import DataTable from "../components/DataTable";
import useDashboard from "../hooks/useDashboard";

const bookingColumns = [
    { key: "bookingId", label: "Booking ID" },
    { key: "customer", label: "Customer" },
    { key: "vehicle", label: "Vehicle" },
    { key: "date", label: "Date" },
    { key: "amount", label: "Amount" },
    {
        key: "status",
        label: "Status",
        render: (value) => {
            const styles = {
                Confirmed: "bg-green-50 text-green-700",
                Pending: "bg-orange-50 text-orange-700",
                Completed: "bg-blue-50 text-blue-700",
            };

            return (
                <span
                    className={`inline - flex rounded-full px-3 py-1.5 text - [10px] font - semibold ${styles[value] || "bg-slate-100 text-slate-600"
                        } `}
                >
                    {value}
                </span>
            );
        },
    },
];

function Dashboard() {
    const {
        statistics,
        revenueData,
        vehicleAvailability,
        bookings,
        activities,
        selectedYear,
        handleYearChange,
    } = useDashboard();

    const total = vehicleAvailability.total;

    const availablePercentage =
        (vehicleAvailability.available / total) * 100;

    const rentedPercentage =
        (vehicleAvailability.rented / total) * 100;

    const maintenancePercentage =
        (vehicleAvailability.maintenance / total) * 100;

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">

                {/* Page Heading */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#17233d]">
                            Dashboard Overview
                        </h1>
                        <p className="mt-2 text-[13px] text-slate-500">
                            Welcome back! Here's what's happening with your business.
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                        November 09, 2026
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statistics.map((item) => {
                        const Icon = item.icon;

                        const iconStyles = {
                            blue: "bg-blue-50 text-blue-600",
                            purple: "bg-purple-50 text-purple-600",
                            green: "bg-green-50 text-green-600",
                            orange: "bg-orange-50 text-orange-600",
                        };

                        return (
                            <div
                                key={item.title}
                                className="rounded-xl border border-slate-200 bg-white p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        {item.title}
                                    </span>

                                    <div
                                        className={`grid h-[42px] w-[42px] place-items-center rounded-xl${iconStyles[item.color]
                                            }`
                                        }
                                    >
                                        <Icon size={21} />
                                    </div >
                                </div >

                                <h2 className="my-5 text-[25px] font-bold text-[#17233d]">
                                    {item.value}
                                </h2>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`flex items-center gap-1 text-[11px] font-semibold ${item.positive ? "text-green-600" : "text-red-500"
                                            }`}
                                    >
                                        {item.positive ? (
                                            <TrendingUp size={14} />
                                        ) : (
                                            <TrendingDown size={14} />
                                        )}
                                        {item.change}
                                    </span>

                                    <small className="text-[10px] text-slate-400">
                                        {item.description}
                                    </small>
                                </div >
                            </div >
                        );
                    })}
                </div >

                {/* Revenue and Availability */}
                < div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]" >

                    {/* Revenue Chart */}
                    < section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" >
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-[15px] font-semibold text-[#17233d]">
                                    Revenue Overview
                                </h3>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Monthly revenue performance
                                </p>
                            </div>

                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>

                        <div className="flex h-[220px] items-end justify-between gap-2">
                            {revenueData.map((item, index) => (
                                <div
                                    key={item.month}
                                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                                >
                                    <div className="flex h-[185px] w-full items-end">
                                        <div
                                            title={`${item.month}: ${item.height}%`}
                                            className={`block w-full rounded-t-md ${index%2 ===0 ? "bg-blue-600":"bg-blue-300"}`}
                                            style={{
                                                height:`${item.height}%`,
                                                minHeight:"8px",
                                            }}
                                        />
                                    </div>

                                    <span className="text-[10px] text-slate-400">
                                        {item.month}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section >

                    {/* Vehicle Availability */}
                    < section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" >
                        <div className="mb-6">
                            <h3 className="text-[15px] font-semibold text-[#17233d]">
                                Vehicle Availability
                            </h3>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Current fleet status
                            </p>
                        </div>

                        <div className="my-5 text-center">
                            <h2 className="text-[32px] font-bold text-[#17233d]">
                                {total}
                            </h2>
                            <span className="text-[11px] text-slate-400">
                                Total Vehicles
                            </span>
                        </div>

                        <div className="mb-7 flex h-[11px] overflow-hidden rounded-full">
                            <div
                                className="bg-[#3158c9]"
                                style={{ width: `${availablePercentage}%` }} />
                            <div
                                className="bg-[#f0a43b]"
                                style={{ width: `${rentedPercentage}%` }} />
                            <div className="bg-[#ef6666]" style={{ width: `${maintenancePercentage}%` }}
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            {[
                                {
                                    label: "Available",
                                    value: vehicleAvailability.available,
                                    color: "bg-[#3158c9]",
                                },
                                {
                                    label: "Rented",
                                    value: vehicleAvailability.rented,
                                    color: "bg-[#f0a43b]",
                                },
                                {
                                    label: "Maintenance",
                                    value: vehicleAvailability.maintenance,
                                    color: "bg-[#ef6666]",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-2 text-xs text-slate-500"
                                >
                                    <span className={`h-[9px] w-[9px] rounded-full ${item.color}`} />
                                    <span>{item.label}</span>
                                    <strong className="ml-auto text-[#17233d]">
                                        {item.value}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </section >
                </div >

                {/* Recent Bookings */}
                < section className="overflow-hidden rounded-xl border border-slate-200 bg-white" >
                    <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                        <div>
                            <h3 className="text-[15px] font-semibold text-[#17233d]">
                                Recent Bookings
                            </h3>
                            <p className="mt-1 text-[11px] text-slate-400">
                                Latest booking transactions
                            </p>
                        </div>

                        <button
                            type="button"
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                            <Eye size={15} />
                            View All
                        </button>
                    </div>

                    <DataTable
                        columns={bookingColumns}
                        data={bookings}
                    />
                </section >

                {/* Recent Activities */}
                < section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" >
                    <div className="mb-5">
                        <h3 className="text-[15px] font-semibold text-[#17233d]">
                            Recent Activities
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Latest updates from your business
                        </p>
                    </div>

                    <div className="flex flex-col">
                        {activities.map((activity) => {
                            const Icon = activity.icon;

                            const activityStyles = {
                                green: "bg-green-50 text-green-600",
                                blue: "bg-blue-50 text-blue-600",
                                orange: "bg-orange-50 text-orange-600",
                            };

                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"
                                >
                                    <div
                                        className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl${activityStyles[activity.color]
                                            }`}
                                    >
                                        <Icon size={18} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs font-semibold text-slate-700">
                                            {activity.title}
                                        </h4>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {activity.description}
                                        </p>
                                    </div>

                                    <span className="hidden shrink-0 items-center gap-1 text-[10px] text-slate-400 sm:flex">
                                        <Clock size={13} />
                                        {activity.time}
                                    </span>
                                </div>
                            );
                        })}
                    </div >
                </section >

            </div >
        </AdminLayout >
    );
}

export default Dashboard;