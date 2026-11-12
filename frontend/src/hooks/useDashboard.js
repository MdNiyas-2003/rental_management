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
).trim().replace(/\s+/g, "").replace(/\/+$/, "");

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
    statistics: [],
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
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/dashboard?year=${encodeURIComponent(selectedYear)}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to load dashboard");
            }

            const data = result.data || {};

            setDashboardData({
                statistics: (data.statistics || []).map((item) => ({
                    ...item,
                    icon: statisticIcons[item.title] || CarFront,
                })),
                revenueData: data.revenueData || [],
                vehicleAvailability: data.vehicleAvailability || emptyData.vehicleAvailability,
                bookings: data.bookings || [],
                activities: (data.activities || []).map((item) => ({
                    ...item,
                    icon: activityIcons[item.type] || CheckCircle,
                })),
            });
        } catch (err) {
            setError(err.message || "Unable to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    return {
        ...dashboardData,
        selectedYear,
        handleYearChange,
        loading,
        error,
        refreshDashboard: fetchDashboard,
    };
}

export default useDashboard;
