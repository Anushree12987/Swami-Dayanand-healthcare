import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaSearch, FaCog, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ThemeToggle from '../common/ThemeToggle';

const Header = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/appointments?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e40af] transition-colors" />
              <input
                type="text"
                placeholder="Search patients, doctors, appointments..."
                className="input pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <ThemeToggle />
            
            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-gray-500 dark:text-gray-400 hover:text-[#1e40af] dark:hover:text-blue-400 rounded-xl relative transition-all duration-300"
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
                )}
              </button>

              {/* Dropdown UI */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs font-bold text-[#1e40af] dark:text-blue-400 hover:underline">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <FaBell className="text-4xl text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => !notif.isRead && markAsRead(notif._id)}
                          className={`p-4 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!notif.isRead ? 'cursor-pointer' : ''}`}
                        >
                          <div className="flex gap-3">
                            {!notif.isRead && <div className="w-2 h-2 mt-1.5 bg-[#1e40af] rounded-full shrink-0"></div>}
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white mb-1 leading-snug">{notif.message}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Link */}
            <Link 
              to="/settings"
              className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-gray-500 dark:text-gray-400 hover:text-[#1e40af] dark:hover:text-blue-400 rounded-xl transition-all duration-300"
            >
              <FaCog className="text-lg" />
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 border-l border-gray-100 dark:border-white/5 ml-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">System Admin</p>
                <p className="text-[10px] font-bold text-[#1e40af] dark:text-blue-400 uppercase tracking-wider">Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">
                SA
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;