import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from "../layout/Header"

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - Scrollable */}
      <div className="lg:ml-72 flex-1 flex flex-col min-h-screen">
        <Header />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;