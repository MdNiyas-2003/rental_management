import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    CarFront,
    Users,
    UserCog,
    CalendarDays,
    Receipt,
    Wrench,
    LogOut,
    X,
    AlertTriangle,
} from "lucide-react";

const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Vehicles", path: "/vehicles", icon: CarFront },
    { label: "Customers", path: "/customers", icon: Users },
    { label: "Staff", path: "/staff", icon: UserCog },
    { label: "Bookings", path: "/bookings", icon: CalendarDays },
    { label: "Invoices", path: "/invoices", icon: Receipt },
    { label: "Maintenance", path: "/maintenance", icon: Wrench },
];

function Sidebar({ isOpen = false, onClose = () => { } }) {
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleLogout = () => {
        setShowLogoutDialog(false);
        onClose();
        navigate("/login", { replace: true });
    };

    return (
        <>
            <aside
                className={`fixed left-0 top-0 z-[1200] flex h-screen h-[100dvh] w-[255px] flex-col overflow-x-hidden overflow-y-auto bg-[#111c35] px-4 py-6 text-white shadow-xl transition-transform duration-300
          min-[601px]:translate-x-0 min-[901px]:w-[255px]
          min-[601px]:max-[900px]:w-[75px] min-[601px]:max-[900px]:px-2
          max-[600px]:w-[min(280px,calc(100vw-45px))]
          ${isOpen ? "max-[600px]:translate-x-0 max-[600px]:visible max-[600px]:pointer-events-auto" : "max-[600px]:-translate-x-full max-[600px]:invisible max-[600px]:pointer-events-none"}`}
                aria-label="Main navigation"
            >
                {/* Brand */}
                <div className="mb-8 flex w-full shrink-0 items-center gap-3 px-1.5">
                    <div className="flex h-11 w-11 min-w-11 items-center justify-center rounded-xl bg-[#3158c9] text-white">
                        <CarFront size={25} />
                    </div>

                    <div className="min-w-0 min-[601px]:max-[900px]:hidden">
                        <h2 className="whitespace-nowrap text-xl font-bold">DriveFlow</h2>
                        <span className="mt-1 block whitespace-nowrap text-[11px] text-[#9caac2]">
                            Rental Management
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close sidebar"
                        className="ml-auto hidden h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#263653] text-white hover:bg-[#344461] max-[600px]:flex"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="w-full">
                    <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.2px] text-[#8190aa] min-[601px]:max-[900px]:hidden">
                        MAIN MENU
                    </p>

                    <nav className="flex w-full flex-col gap-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    title={item.label}
                                    className={({ isActive }) =>
                                        `flex min-h-11 w-full items-center gap-[13px] rounded-lg px-3 py-[11px] text-left text-[13px] font-medium whitespace-nowrap transition-colors
                    min-[601px]:max-[900px]:justify-center min-[601px]:max-[900px]:px-2
                    ${isActive
                                            ? "bg-[#3158c9] font-semibold text-white"
                                            : "bg-transparent text-[#aab6ca] hover:bg-[#202e4c] hover:text-white"
                                        }`
                                    }
                                >
                                    <Icon size={19} className="shrink-0" />
                                    <span className="min-[601px]:max-[900px]:hidden">
                                        {item.label}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout */}
                <div className="mt-auto w-full border-t border-white/10 pt-6">
                    <button
                        type="button"
                        onClick={() => setShowLogoutDialog(true)}
                        className="flex min-h-11 w-full items-center gap-[13px] rounded-lg px-3 py-[11px] text-left text-[13px] font-medium text-red-300 transition-colors hover:bg-red-950/70 hover:text-white min-[601px]:max-[900px]:justify-center min-[601px]:max-[900px]:px-2"
                    >
                        <LogOut size={19} className="shrink-0" />
                        <span className="min-[601px]:max-[900px]:hidden">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Premium logout confirmation dialog */}
            {showLogoutDialog && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowLogoutDialog(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-title"
                        className="w-full max-w-[410px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                    >
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <AlertTriangle size={23} />
                        </div>

                        <div className="text-center">
                            <h2 id="logout-title" className="text-lg font-semibold text-slate-900">
                                Confirm Logout
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Are you sure you want to exit your DriveFlow account?
                            </p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutDialog(false)}
                                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="h-10 flex-1 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;
