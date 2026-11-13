
import { useCallback, useEffect, useState } from "react";
import {
    CarFront,
    Users,
    CalendarDays,
    IndianRupee,
    CheckCircle,
    Wrench,
} from "lucide-react";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
)
    .trim()
    .replace(/\/+$/, "");

const defaultStatistics = [
    {
        title: "Total Vehicles",
        value: 0,
        icon: CarFront,
        positive: true,
        change: "0%",
        description: "vs last month",
        color: "blue",
    },
    {
        title: "Active Bookings",
        value: 0,
        icon: CalendarDays,
        positive: true,
        change: "0%",
        description: "vs last month",
        color: "purple",
    },
    {
        title: "Total Customers",
        value: 0,
        icon: Users,
        positive: true,
        change: "0%",
        description: "vs last month",
        color: "green",
    },
    {
        title: "Total Revenue",
        value: "₹0",
        icon: IndianRupee,
        positive: true,
        change: "0%",
        description: "vs last month",
        color: "orange",
    },
];

const statisticIcons = {
    "Total Vehicles": CarFront,
    "Active Bookings": CalendarDays,
    "Total Customers": Users,
    "Total Revenue": IndianRupee,
};

const activityIcons = {
    booking: CheckCircle,
    maintenance: Wrench,
};

const emptyData = {
    statistics: defaultStatistics,
    revenueData: [],
    vehicleAvailability: {
        total: 0,
        available: 0,
        rented: 0,
        maintenance: 0,
    },
    bookings: [],
    activities: [],
};

function useDashboard() {
    const [dashboardData, setDashboardData] = useState(emptyData);

    const [selectedYear, setSelectedYear] = useState(
        String(new Date().getFullYear())
    );

    const [loading, setLoading] = useState(true);

    const [notification, setNotification] = useState(null);

    // DISMISS NOTIFICATION
    const dismissNotification = useCallback(() => {
        setNotification(null);
    }, []);

    // AUTO HIDE NOTIFICATION AFTER 3 SECONDS
    useEffect(() => {
        if (!notification) return;

        const timer = setTimeout(() => {
            setNotification(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [notification]);

    // FETCH DASHBOARD DATA
    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/dashboard?year=${encodeURIComponent(selectedYear)}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to load dashboard data."
                );
            }

            const data = result.data || {};

            // KEEP ALL FOUR STATISTICS CARDS
            const apiStatistics = data.statistics || [];

            const statistics = defaultStatistics.map((defaultItem) => {
                const apiItem = apiStatistics.find(
                    (item) => item.title === defaultItem.title
                );

                return {
                    ...defaultItem,
                    ...(apiItem || {}),
                    icon: statisticIcons[defaultItem.title],
                    value: apiItem?.value ?? defaultItem.value,
                };
            });

            setDashboardData({
                statistics,

                revenueData: data.revenueData || [],

                vehicleAvailability: {
                    ...emptyData.vehicleAvailability,
                    ...(data.vehicleAvailability || {}),
                },

                bookings: data.bookings || [],

                activities: (data.activities || []).map((item) => ({
                    ...item,
                    icon: activityIcons[item.type] || CheckCircle,
                })),
            });

            // CLEAR OLD NOTIFICATION AFTER SUCCESSFUL FETCH
            setNotification(null);
        } catch (err) {
            console.error("Dashboard loading error:", err);

            // KEEP DASHBOARD VISIBLE WITH DEFAULT VALUES
            setDashboardData(emptyData);

            // SHOW ACTUAL ERROR MESSAGE
            setNotification({
                message: err.message || "Failed to load dashboard data.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    // INITIAL FETCH AND YEAR CHANGE
    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // YEAR CHANGE
    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    return {
        ...dashboardData,
        selectedYear,
        handleYearChange,
        loading,
        notification,
        dismissNotification,
        refreshDashboard: fetchDashboard,
    };
}

export default useDashboard;
