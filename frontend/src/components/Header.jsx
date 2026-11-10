import {
    Search,
    Bell,
    UserCircle,
    ChevronDown,
    Menu,
} from "lucide-react";

function Header({ onMenuClick }) {
    return (
        <header className="sticky top-0 z-[900] flex h-[75px] w-full items-center justify-between gap-4 border-b border-[#e8edf3] bg-white px-[30px] max-[900px]:px-5 max-[600px]:h-[65px] max-[600px]:gap-2 max-[600px]:px-3">

            {/* Left Section */}
            <div className="flex min-w-0 flex-1 items-center gap-[14px] max-[600px]:gap-[9px]">

                {/* Mobile Menu */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-slate-100 text-slate-700 hover:bg-slate-200 max-[600px]:flex"
                >
                    <Menu size={23} />
                </button>

                {/* Search */}
                <div className="flex h-[42px] w-[320px] max-w-full items-center gap-[11px] rounded-[9px] border border-transparent bg-[#f5f7fa] px-[14px] text-slate-500 focus-within:border-[#3158c9] focus-within:bg-white focus-within:ring-[3px] focus-within:ring-blue-100 max-[900px]:w-[260px] max-[600px]:h-[38px] max-[600px]:w-full max-[600px]:max-w-[190px] max-[600px]:gap-[7px] max-[600px]:px-[9px]">
                    <Search size={19} className="shrink-0" />

                    <input
                        type="text"
                        placeholder="Search anything..."
                        aria-label="Search"
                        className="h-full w-full min-w-0 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 max-[600px]:text-[11px]"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex shrink-0 items-center gap-5 max-[900px]:gap-3 max-[600px]:gap-[7px]">

                {/* Notifications */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-10 w-10 items-center justify-center rounded-[9px] text-slate-600 hover:bg-slate-100 max-[600px]:h-[34px] max-[600px]:w-[34px]"
                >
                    <Bell size={20} />
                    <span className="absolute right-[9px] top-2 h-[7px] w-[7px] rounded-full border border-white bg-red-500" />
                </button>

                {/* Profile */}
                <div className="flex cursor-pointer items-center gap-[10px]">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8efff] text-[#3158c9] max-[600px]:h-[34px] max-[600px]:w-[34px]">
                        <UserCircle size={25} />
                    </div>

                    <div className="flex flex-col gap-[3px] max-[600px]:hidden">
                        <h4 className="text-xs font-semibold text-slate-800">
                            Administrator
                        </h4>
                        <span className="text-[11px] text-slate-500">
                            Admin
                        </span>
                    </div>

                    <ChevronDown
                        size={17}
                        className="text-slate-500 max-[600px]:hidden"
                    />
                </div>
            </div>
        </header>
    );
}

export default Header;