import { useState } from "react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen w-full min-w-0 box-border overflow-x-hidden bg-[#f5f7fb]">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[1100] bg-slate-900/55 backdrop-blur-[2px] min-[601px]:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main area */}
      <div className="ml-[255px] flex min-w-0 w-[calc(100%-255px)] flex-1 flex-col max-[900px]:ml-[75px] max-[900px]:w-[calc(100%-75px)] max-[600px]:ml-0 max-[600px]:w-full">
        <Header onMenuClick={openSidebar} />

        {/* Page content */}
        <main className="w-full min-w-0 flex-1 p-[30px] max-[900px]:p-5 max-[600px]:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
