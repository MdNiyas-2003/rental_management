import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Customers from "./pages/Customers";
import Staff from "./pages/Staff";
import Bookings from "./pages/Bookings";
import Maintenance from "./pages/Maintenance";
import VehiclePickupReturn from "./pages/VehiclePickupReturn";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route
    path="/vehicle-pickup-return"
    element={<VehiclePickupReturn />}
/>
                <Route path="/maintenance" element={<Maintenance/>}/>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;