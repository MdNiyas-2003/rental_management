const prisma = require("../config/prisma");

const money = (value) => Number(value || 0);

const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getDashboard = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const parsedYear = Number.parseInt(req.query.year, 10);
        const year = Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100
            ? parsedYear
            : currentYear;

        const yearStart = new Date(year, 0, 1);
        const nextYearStart = new Date(year + 1, 0, 1);

        const [
            totalVehicles,
            availableVehicles,
            rentedVehicles,
            maintenanceVehicles,
            totalCustomers,
            activeBookings,
            totalPaid,
            yearPayments,
            recentBookings,
            recentMaintenance,
        ] = await Promise.all([
            prisma.vehicle.count(),
            prisma.vehicle.count({ where: { status: "Available" } }),
            prisma.vehicle.count({ where: { status: "Rented" } }),
            prisma.vehicle.count({ where: { status: "Maintenance" } }),
            prisma.customer.count(),
            prisma.booking.count({
                where: { status: { in: ["Confirmed", "Active"] } },
            }),
            prisma.payment.aggregate({
                _sum: { amount: true },
            }),
            prisma.payment.findMany({
                where: {
                    paidAt: {
                        gte: yearStart,
                        lt: nextYearStart,
                    },
                },
                select: {
                    amount: true,
                    paidAt: true,
                },
            }),
            prisma.booking.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    customer: {
                        include: {
                            user: { select: { name: true } },
                        },
                    },
                    vehicle: {
                        select: { name: true, number: true },
                    },
                },
            }),
            prisma.maintenance.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    vehicle: { select: { name: true, number: true } },
                },
            }),
        ]);

        const monthlyTotals = Array(12).fill(0);
        yearPayments.forEach((payment) => {
            monthlyTotals[new Date(payment.paidAt).getMonth()] += money(payment.amount);
        });

        const maxMonthlyRevenue = Math.max(...monthlyTotals, 1);
        const revenueData = monthlyTotals.map((revenue, index) => ({
            month: monthLabels[index],
            revenue: Number(revenue.toFixed(2)),
            height: revenue === 0 ? 0 : Math.max(5, Math.round((revenue / maxMonthlyRevenue) * 100)),
        }));

        const bookingActivities = recentBookings.map((booking) => ({
            id: `booking-${booking.id}`,
            type: "booking",
            title: `Booking ${booking.status}`,
            description: `${booking.bookingId} · ${booking.customer?.user?.name || "Customer"} `,
            time: booking.createdAt,
            color: booking.status === "Confirmed" || booking.status === "Active"
                ? "green"
                : booking.status === "Pending"
                    ? "blue"
                    : "orange",
        }));

        const maintenanceActivities = recentMaintenance.map((record) => ({
            id: `maintenance-${record.id}`,
            type: "maintenance",
            title: `Vehicle maintenance ${record.status}`,
            description: `${record.vehicle?.name || "Vehicle"} · ${record.maintenanceId}`,
            time: record.createdAt,
            color: "orange",
        }));

        const activities = [...bookingActivities, ...maintenanceActivities]
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 6)
            .map((activity) => ({
                ...activity,
                time: formatDate(activity.time),
            }));

        return res.status(200).json({
            success: true,
            data: {
                statistics: [
                    {
                        title: "Total Vehicles",
                        value: String(totalVehicles),
                        change: "",
                        positive: true,
                        color: "blue",
                        description: "Registered fleet",
                    },
                    {
                        title: "Active Bookings",
                        value: String(activeBookings),
                        change: "",
                        positive: true,
                        color: "purple",
                        description: "Confirmed and active",
                    },
                    {
                        title: "Total Customers",
                        value: String(totalCustomers),
                        change: "",
                        positive: true,
                        color: "green",
                        description: "Registered customers",
                    },
                    {
                        title: "Total Revenue",
                        value: `₹${money(totalPaid._sum.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`,
                        change: "",
                        positive: true,
                        color: "orange",
                        description: "Payments collected",
                    },
                ],
                revenueData,
                vehicleAvailability: {
                    total: totalVehicles,
                    available: availableVehicles,
                    rented: rentedVehicles,
                    maintenance: maintenanceVehicles,
                },
                bookings: recentBookings.map((booking) => ({
                    id: booking.id,
                    bookingId: booking.bookingId,
                    customer: booking.customer?.user?.name || "—",
                    vehicle: booking.vehicle?.name || "—",
                    date: formatDate(booking.pickupDate),
                    amount: `₹${money(booking.totalAmount).toLocaleString("en-IN")}`,
                    status: booking.status,
                })),
                activities,
                year,
            },
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load dashboard data",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

module.exports = { getDashboard };
