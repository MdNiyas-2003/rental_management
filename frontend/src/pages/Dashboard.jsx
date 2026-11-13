import {
    TrendingUp,
    TrendingDown,
    Clock,
    Eye,
    CarFront,
    Users,
    CalendarDays,
    IndianRupee,
    CheckCircle,
    Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        styles[value] || "bg-slate-100 text-slate-600"
                    }`}
                >
                    {value}
                </span>
            );
        },
    },
];

const statIconStyles = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
};

const activityStyles = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
};

function Dashboard() {
    const navigate = useNavigate();

    const {
        statistics,
        revenueData,
        vehicleAvailability,
        bookings,
        activities,
        selectedYear,
        handleYearChange,
        loading,
        error,
        refreshDashboard,
    } = useDashboard();

    const total = Math.max(vehicleAvailability.total, 1);
    const availablePercentage = (vehicleAvailability.available / total) * 100;
    const rentedPercentage = (vehicleAvailability.rented / total) * 100;
    const maintenancePercentage = (vehicleAvailability.maintenance / total) * 100;

    return (
        <AdminLayout>
            <div className="flex min-h-[calc(100dvh-135px)] flex-col gap-3 overflow-x-hidden overflow-y-auto xl:h-[calc(100dvh-135px)] xl:min-h-0 xl:overflow-hidden">
                {/* Page heading */}
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold leading-tight text-[#17233d]">
                            Dashboard Overview
                        </h1>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Welcome back! Here's what's happening with your business.
                        </p>
                    </div>

                    <div className="flex w-full justify-end sm:w-auto">
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
                        {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex shrink-0 items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={refreshDashboard}
                            className="shrink-0 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                    {loading && statistics.length === 0
                        ? Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="min-h-[82px] animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                            />
                        ))
                        : statistics.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="flex min-h-[76px] min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:min-h-[82px] sm:px-4 sm:py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-[11px] text-slate-500">
                                        {item.title}
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold leading-tight text-[#17233d] sm:text-xl">
                                        {item.value}
                                    </h2>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                        <span
                                            className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                                                item.positive ? "text-green-600" : "text-red-500"
                                            }`}
                                        >
                                            {item.positive ? (
                                                <TrendingUp size={12} />
                                            ) : (
                                                <TrendingDown size={12} />
                                            )}
                                            {item.change}
                                        </span>
                                        <span className="text-[9px] text-slate-400">
                                            {item.description}
                                        </span>
                                    </div>
                                </div>

                                <div
                                   className={`grid h-9 w-9 translate-y-4 shrink-0 place-items-center rounded-lg ${
                                        statIconStyles[item.color] || "bg-slate-50 text-slate-600"
                                    }`}
                                >
                                    <Icon size={18} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dashboard content: two compact rows */}
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-rows-2">
                    {/* Revenue and vehicle availability */}
                    <div className="grid min-h-[220px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.65fr_1fr]">
                        <section className="flex min-h-[210px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
                            <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-[13px] font-semibold text-[#17233d]">
                                        Revenue Overview
                                    </h3>
                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                        Monthly revenue performance
                                    </p>
                                </div>

                                <select
                                    value={selectedYear}
                                    onChange={(event) => handleYearChange(event.target.value)}
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-600 outline-none focus:border-blue-400"
                                >
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>

                            <div className="flex min-h-0 flex-1 items-end justify-between gap-2 pt-2">
                                {revenueData.length > 0 ? revenueData.map((item, index) => (
                                    <div
                                        key={item.month}
                                        className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                                    >
                                        <div className="flex min-h-0 w-full flex-1 items-end">
                                            <div
                                                title={`${item.month}: ${item.height}%`}
                                                className={`w-full rounded-t-sm ${
                                                    index % 2 === 0 ? "bg-blue-600" : "bg-blue-300"
                                                }`}
                                                style={{
                                                    height: `${item.height}%`,
                                                    minHeight: "5px",
                                                }}
                                            />
                                        </div>
                                        <span className="text-[9px] text-slate-400">
                                            {item.month}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="mb-8 w-full text-center text-[11px] text-slate-400">
                                        {loading ? "Loading revenue..." : "No payment records for this year"}
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="flex min-h-[210px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
                            <div className="shrink-0">
                                <h3 className="text-[13px] font-semibold text-[#17233d]">
                                    Vehicle Availability
                                </h3>
                                <p className="mt-0.5 text-[10px] text-slate-400">
                                    Current fleet status
                                </p>
                            </div>

                            <div className="my-2 text-center">
                                <h2 className="text-2xl font-bold leading-tight text-[#17233d]">
                                    {vehicleAvailability.total}
                                </h2>
                                <span className="text-[10px] text-slate-400">
                                    Total Vehicles
                                </span>
                            </div>

                            <div className="mb-3 flex h-2 shrink-0 overflow-hidden rounded-full">
                                <div
                                    className="bg-[#3158c9]"
                                    style={{ width: `${availablePercentage}%` }}
                                />
                                <div
                                    className="bg-[#f0a43b]"
                                    style={{ width: `${rentedPercentage}%` }}
                                />
                                <div
                                    className="bg-[#ef6666]"
                                    style={{ width: `${maintenancePercentage}%` }}
                                />
                            </div>

                            <div className="flex min-h-0 flex-col justify-around gap-2">
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
                                        className="flex items-center gap-2 text-[11px] text-slate-500"
                                    >
                                        <span className={`h-2 w-2 rounded-full ${item.color}`} />
                                        <span>{item.label}</span>
                                        <strong className="ml-auto text-[11px] font-semibold text-[#17233d]">
                                            {item.value}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Recent bookings and activities */}
                    <div className="grid min-h-[220px] grid-cols-1 gap-3 lg:grid-cols-[1.65fr_1fr]">
                        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
                                <div>
                                    <h3 className="text-[13px] font-semibold text-[#17233d]">
                                        Recent Bookings
                                    </h3>
                                    <p className="mt-0.5 text-[10px] text-slate-400">
                                        Latest booking transactions
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate("/bookings")}
                                    className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    <Eye size={13} />
                                    View All
                                </button>
                            </div>

                            <div className="hidden min-h-0 flex-1 overflow-hidden lg:block">
                                <DataTable columns={bookingColumns} data={bookings} compact pageSize={4} />
                            </div>

                            <div className="grid gap-2 p-3 lg:hidden">
                                {bookings.length === 0 ? (
                                    <p className="py-6 text-center text-xs text-slate-400">No recent bookings</p>
                                ) : bookings.slice(0, 4).map((booking) => (
                                    <div key={booking.id || booking.bookingId} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-[#17233d]">{booking.bookingId || "Booking"}</p>
                                                <p className="mt-1 truncate text-[11px] text-slate-600">{booking.customer || booking.customerName || "—"}</p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">{booking.status || "—"}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                                            <span className="truncate">{booking.vehicle || booking.vehicleName || "—"}</span>
                                            <span className="shrink-0">{booking.date || "—"}</span>
                                        </div>
                                        <p className="mt-1 text-xs font-semibold text-[#17233d]">{booking.amount || "—"}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
                            <div className="mb-2 shrink-0">
                                <h3 className="text-[13px] font-semibold text-[#17233d]">
                                    Recent Activities
                                </h3>
                                <p className="mt-0.5 text-[10px] text-slate-400">
                                    Latest updates from your business
                                </p>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col justify-around overflow-hidden">
                                {activities.map((activity) => {
                                    const Icon = activity.icon;

                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex min-w-0 items-center gap-2.5 border-b border-slate-100 py-2 last:border-0"
                                        >
                                            <div
                                                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                                                    activityStyles[activity.color] ||
                                                    "bg-slate-50 text-slate-600"
                                                }`}
                                            >
                                                <Icon size={15} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-[11px] font-semibold text-slate-700">
                                                    {activity.title}
                                                </h4>
                                                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                                    {activity.description}
                                                </p>
                                            </div>

                                            <span className="hidden shrink-0 items-center gap-1 text-[9px] text-slate-400 sm:flex">
                                                <Clock size={11} />
                                                {activity.time}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Dashboard;
