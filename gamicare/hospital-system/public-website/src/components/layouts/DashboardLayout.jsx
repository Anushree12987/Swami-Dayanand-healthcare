import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaHistory, 
  FaUser, 
  FaBell, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaCheckDouble
} from 'react-icons/fa';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedNotifId, setExpandedNotifId] = useState(null);
  const dropdownRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    try {
      const response = await axios.get('http://localhost:5001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5001/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put('http://localhost:5001/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowNotifications(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [user]);

  // Show spinner while auth is being verified
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 dark:from-[#0F172A] to-gray-100 dark:to-[#1E3A8A]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#2563EB] border-t-transparent"></div>
          <p className="text-[#2563EB] font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { path: '/patient/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/patient/book-appointment', icon: FaCalendarAlt, label: 'Book Appointment' },
    { path: '/patient/appointments', icon: FaHistory, label: 'My Appointments' },
    { path: '/patient/profile', icon: FaUser, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 dark:from-[#0F172A] to-gray-100 dark:to-[#1E3A8A]">
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-[#1E40AF]/20 to-[#1E3A8A]/20 shadow-sm border-b border-gray-200 dark:border-[#2563EB]/20">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#2563EB]/10 text-[#2563EB] transition-all"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Gamicare
          </h1>
          <div className="flex items-center gap-3 relative">
            <ThemeToggle />
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-[#2563EB]"
            >
              <FaBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border border-[#0F172A]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        
        {/* Sidebar - Modern & Clean */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-gray-50 dark:from-[#0F172A] to-gray-100 dark:to-[#1E3A8A]
            shadow-2xl
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-300 ease-in-out
            overflow-y-auto border-r border-gray-200 dark:border-[#2563EB]/20
          `}
        >
          <div className="flex flex-col h-full">
            
            {/* User Info - Elegant Design */}
            <div className="p-6 border-b border-gray-200 dark:border-[#2563EB]/20">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-full blur-sm opacity-30"></div>
                  {user?.profilePicture ? (
                    <img 
                      src={`http://localhost:5001${user.profilePicture}`} 
                      alt="Profile" 
                      className="relative w-14 h-14 rounded-full border-2 border-white/20 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="relative w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center text-gray-900 dark:text-white font-bold text-xl">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</h2>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-gradient-to-r from-[#2563EB]/20 to-[#1E40AF]/20 rounded-full border border-gray-200 dark:border-[#2563EB]/30">
                      <p className="text-xs font-medium text-[#2563EB]">Patient</p>
                    </div>
                    <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation - Clean & Modern */}
            <nav className="flex-1 p-5">
              <p className="text-xs uppercase tracking-wider text-[#2563EB]/80 font-semibold mb-4 px-2">
                Navigation
              </p>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                        location.pathname === item.path
                          ? 'bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-gray-900 dark:text-white shadow-lg'
                          : 'text-gray-600 dark:text-white/90 hover:bg-gradient-to-r hover:from-[#2563EB]/10 hover:to-[#1E40AF]/10 hover:text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          location.pathname === item.path 
                            ? 'bg-white/20' 
                            : 'bg-[#2563EB]/10 group-hover:bg-[#2563EB]/20'
                        }`}>
                          <item.icon className={
                            location.pathname === item.path 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-[#2563EB] group-hover:text-gray-900 dark:text-white'
                          } />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {location.pathname === item.path ? (
                        <FaChevronRight className="text-gray-900 dark:text-white" />
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaChevronRight className="text-[#2563EB]" size={12} />
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer & Logout */}
            <div className="p-5 border-t border-gray-200 dark:border-[#2563EB]/20">
              <div className="space-y-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-3 text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 rounded-xl transition-all duration-300 group border border-red-500/20"
                >
                  <div className="p-2.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
                    <FaSignOutAlt size={14} className="text-red-400" />
                  </div>
                  <span className="font-medium text-gray-600 dark:text-white/90">Logout</span>
                </button>
              </div>

              {/* Branding */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#2563EB]/20">
                <p className="text-center text-xs text-[#2563EB]/60">
                  © {new Date().getFullYear()} Gamicare
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="ml-0 lg:ml-72 flex-1 h-screen overflow-y-auto pt-16 lg:pt-0">
          {/* Desktop Top Bar */}
          <div className="relative z-50 hidden lg:flex items-center justify-between bg-gradient-to-r from-[#1E40AF]/20 to-[#1E3A8A]/20 backdrop-blur-sm border-b border-gray-200 dark:border-[#2563EB]/20 px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
              <p className="text-[#2563EB]/80 text-sm mt-1">
                Welcome back! Your health journey continues here.
              </p>
            </div>
            <div className="flex items-center gap-4">
              
              <ThemeToggle />

              {/* Desktop Notifications Bell */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-3 rounded-full transition-all duration-300 border border-gray-200 dark:border-[#2563EB]/20 group ${
                    showNotifications ? 'bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-gray-900 dark:text-white' : 'hover:bg-gradient-to-r hover:from-[#2563EB]/10 hover:to-[#1E40AF]/10'
                  }`}
                >
                  <FaBell className={showNotifications ? 'text-gray-900 dark:text-white' : 'text-[#2563EB] group-hover:text-gray-900 dark:text-white'} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border border-[#0F172A] shadow-lg animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown UI - Matches Admin Style */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#2563EB]/30 rounded-2xl shadow-2xl z-[9999] overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-200 dark:border-[#2563EB]/20 flex justify-between items-center bg-gradient-to-r from-[#1E40AF]/20 to-[#1E3A8A]/20">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaBell className="text-[#2563EB]" size={14} />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[10px] uppercase tracking-wider text-[#2563EB] hover:text-gray-900 dark:text-white transition-colors font-bold flex items-center gap-1"
                        >
                          <FaCheckDouble size={10} />
                          All Read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaBell className="text-[#2563EB]/40" size={20} />
                          </div>
                          <p className="text-[#2563EB]/60 text-sm">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                              setExpandedNotifId(expandedNotifId === notif._id ? null : notif._id);
                            }}
                            className={`p-4 border-b border-[#2563EB]/10 hover:bg-[#2563EB]/10 transition-all cursor-pointer group ${
                              !notif.isRead ? 'bg-[#2563EB]/5 border-l-2 border-l-[#2563EB]' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/70'}`}>
                                {notif.title}
                              </h4>
                              {!notif.isRead && (
                                <span className="w-2 h-2 bg-[#2563EB] rounded-full"></span>
                              )}
                            </div>
                            <p className={`text-xs text-gray-500 dark:text-white/60 leading-relaxed mb-2 transition-all duration-300 ${expandedNotifId === notif._id ? 'line-clamp-none' : 'line-clamp-2'}`}>
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-[#2563EB]/50 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <Link 
                      to="/patient/notifications" 
                      onClick={() => setShowNotifications(false)}
                      className="block p-3 text-center text-xs font-bold text-[#2563EB] hover:bg-[#2563EB]/10 transition-colors bg-[#1E40AF]/10"
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/patient/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-[#2563EB]/10 hover:to-[#1E40AF]/10 transition-all duration-300 border border-gray-200 dark:border-[#2563EB]/20 cursor-pointer">
                {user?.profilePicture ? (
                  <img 
                    src={`http://localhost:5001${user.profilePicture}`} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-gray-900 dark:text-white font-bold">
                    {user?.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-[#2563EB]">Patient</p>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-br from-[#1E3A8A]/50 to-[#0F172A]/50 rounded-2xl shadow-xl border border-gray-200 dark:border-[#2563EB]/20 p-6 backdrop-blur-sm">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
;