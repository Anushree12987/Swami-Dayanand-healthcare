import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaHospital,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaBullhorn
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/doctors', icon: FaUserMd, label: 'Doctors' },
    { path: '/departments', icon: FaHospital, label: 'Departments' },
    { path: '/patients', icon: FaUsers, label: 'Patients' },
    { path: '/appointments', icon: FaCalendarAlt, label: 'Appointments' },
    { path: '/reports', icon: FaChartBar, label: 'Reports' },
    { path: '/broadcast', icon: FaBullhorn, label: 'Broadcast' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-[#1e40af] text-white rounded-xl shadow-lg shadow-blue-500/30"
      >
        {collapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
      </button>

      {/* Sidebar Container */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#0f172a] border-r border-gray-100 dark:border-white/5 z-40 flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none ${collapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Branding Logo */}
        <div className="p-6">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20`}>
            <div className="p-2.5 bg-[#1e40af] text-white rounded-xl shadow-lg shadow-blue-600/20">
              <FaHospital className={collapsed ? 'text-lg' : 'text-xl'} />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  Swami Dayanand
                </h2>
                <p className="text-[10px] uppercase tracking-wider text-[#1e40af] dark:text-blue-400 font-bold">
                  Admin Portal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto overflow-x-hidden">
          <div>
            {!collapsed && (
              <p className="px-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                Main Menu
              </p>
            )}
            <ul className="space-y-1.5">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link group ${
                        isActive 
                          ? 'active' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1e40af] dark:hover:text-blue-400'
                      } ${collapsed ? 'justify-center px-2' : ''}`
                    }
                  >
                    <div className={`p-2 rounded-lg transition-colors ${collapsed ? '' : ''}`}>
                      <item.icon className="text-lg group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Bottom Section: User & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          {!collapsed && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1e40af] text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">
                  AD
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-900 dark:text-white truncate">Admin User</p>
                  <p className="text-[10px] text-gray-500 font-medium">SYSTEM ADMINISTRATOR</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`btn-secondary w-full py-3 group hover:border-red-200 dark:hover:border-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all ${collapsed ? 'px-0' : ''}`}
          >
            <FaSignOutAlt className="text-lg group-hover:rotate-12 transition-transform" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 hidden lg:flex items-center justify-center w-6 h-10 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#1e40af] rounded-full shadow-lg transition-all"
        >
          <FaChevronLeft size={10} className={`transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </>
  );
};

export default Sidebar;