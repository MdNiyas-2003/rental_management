import { useState } from "react";
import {
statistics,
revenueData,
vehicleAvailability,
bookings,
activities,
} from "../data/dashboardData";

function useDashboard() {
const [selectedYear, setSelectedYear] = useState("2026");

const handleYearChange = (year) => {
setSelectedYear(year);
};

return {
statistics,
revenueData,
vehicleAvailability,
bookings,
activities,
selectedYear,
handleYearChange,
};
}

export default useDashboard;