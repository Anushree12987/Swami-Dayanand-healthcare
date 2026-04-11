import React, { useState, useEffect } from 'react'
import { Menu, Bell, Search, User, LogOut, Settings, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import notificationService from '../../services/notificationService'
import ThemeToggle from '../common/ThemeToggle'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ limit: 5 })
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      fetchNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Availability', path: '/availability' },
    { name: 'Profile', path: '/profile' },
    { name: 'Notifications', path: '/notifications' }
  ]

  return (
    <nav className="bg-white dark:bg-[#1E3A8A] border-b border-gray-200 dark:border-[#2563EB]/20 sticky top-0 z-40 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo & Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2563EB]/20"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="ml-4 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight text-gray-900 dark:text-white">Swami Dayanand</h1>
                <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-[#2563EB] font-bold">Doctor Portal</p>
              </div>
            </div>
          </div>

          {/* Center - Search (desktop) */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-white/40" />
              </div>
              <input
                type="search"
                placeholder="Search appointments, patients..."
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#2563EB]/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-[#0F172A] transition-all"
              />
            </div>
          </div>

          {/* Right side - Icons & Profile */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg relative transition-all ${
                  showNotifications ? 'bg-blue-50 dark:bg-[#2563EB]/20 text-blue-600 dark:text-[#2563EB]' : 'text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2563EB]/10'
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#1E3A8A] shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl border border-gray-100 dark:border-[#2563EB]/20 z-20 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 bg-gray-50 dark:bg-[#1E3A8A]/50 border-b border-gray-200 dark:border-[#2563EB]/20 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={async () => {
                            await notificationService.markAllAsRead()
                            fetchNotifications()
                          }}
                          className="text-[10px] text-blue-600 dark:text-[#2563EB] font-bold uppercase hover:text-blue-800 dark:hover:text-white"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-white/50">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-200 dark:text-white/20" />
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id}
                            className={`p-4 border-b border-gray-100 dark:border-[#2563EB]/10 hover:bg-blue-50 dark:hover:bg-[#2563EB]/10 transition-colors group cursor-pointer ${!notif.isRead ? 'bg-blue-50/30 dark:bg-[#2563EB]/5' : ''}`}
                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <p className={`font-semibold text-sm ${!notif.isRead ? 'text-blue-900 dark:text-white' : 'text-gray-700 dark:text-white/70'}`}>
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <div className="w-2 h-2 bg-blue-500 dark:bg-[#2563EB] rounded-full mt-1.5"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-white/50 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-white/30 mt-2 font-medium">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-[#1E3A8A]/30 p-2">
                      <Link
                        to="/notifications"
                        className="block text-center py-2 text-sm font-bold text-blue-600 dark:text-[#2563EB] hover:text-blue-800 dark:hover:text-white hover:bg-blue-100/50 dark:hover:bg-[#2563EB]/10 rounded-lg transition-colors"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-3 p-1 padding-right-2 rounded-xl transition-all ${
                  showProfileMenu ? 'bg-blue-50 dark:bg-[#2563EB]/20 ring-1 ring-blue-500 dark:ring-[#2563EB]' : 'hover:bg-gray-100 dark:hover:bg-[#2563EB]/10 border border-transparent'
                }`}
              >
                <div className="h-8 w-8 bg-blue-600 dark:bg-gradient-to-br dark:from-[#2563EB] dark:to-[#1E40AF] rounded-lg flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block text-left pr-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">Dr. {user?.name}</p>
                  <p className="text-[10px] text-blue-600 dark:text-[#2563EB] font-bold uppercase">{user?.specialization}</p>
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl border border-gray-100 dark:border-[#2563EB]/20 z-20 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-[#1E3A8A]/50 border-b border-gray-200 dark:border-[#2563EB]/20">
                      <p className="font-bold text-gray-900 dark:text-white">Dr. {user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-white/80 hover:bg-blue-50 dark:hover:bg-[#2563EB]/10 hover:text-blue-600 dark:hover:text-white rounded-lg transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-white/80 hover:bg-blue-50 dark:hover:bg-[#2563EB]/10 hover:text-blue-600 dark:hover:text-white rounded-lg transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <div className="h-px bg-gray-100 dark:bg-[#2563EB]/20 my-2"></div>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white dark:bg-[#0F172A] border-t border-gray-200 dark:border-[#2563EB]/20 py-2 px-4 shadow-xl">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-3 rounded-lg text-sm font-bold text-gray-700 dark:text-white/80 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-[#2563EB]/10 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar;