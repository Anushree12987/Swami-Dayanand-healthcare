import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Bell,
  Settings,
  LogOut,
  Stethoscope
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../common/ThemeToggle'

const Sidebar = () => {
  const { user, logout } = useAuth()

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/schedule', icon: Clock, label: 'Schedule' },
    { path: '/availability', icon: Clock, label: 'Availability' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-white dark:from-[#1E3A8A] to-gray-50 dark:to-[#0F172A] border-r border-gray-200 dark:border-[#2563EB]/20 flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-[#2563EB]/20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] p-3 rounded-xl shadow-lg">
            <Stethoscope className="h-6 w-6 text-gray-900 dark:text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white"> Swami Dayanand Hospital</h1>
            <p className="text-sm text-[#2563EB]/80">Doctor Management Portal</p>
          </div>
        </div>
      </div>



      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-gray-900 dark:text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-gray-900 dark:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {/* User Info */}
      <div className="p-6 border-b border-gray-200 dark:border-[#2563EB]/20">
        <NavLink to="/profile" className="flex items-center gap-3 hover:bg-gradient-to-r hover:from-[#2563EB]/5 hover:to-[#1E40AF]/5 p-2 -mx-2 rounded-xl transition-all cursor-pointer group">
          <div className="h-12 w-12 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <User className="h-6 w-6 text-gray-900 dark:text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#2563EB] transition-colors">Dr. {user?.name}</p>
            <p className="text-sm text-[#2563EB]/80">{user?.specialization}</p>
          </div>
        </NavLink>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-[#2563EB]/20">
        <div className="flex items-center justify-between px-4 py-3 mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-white/70">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-[#2563EB] hover:text-gray-900 dark:text-white hover:bg-gradient-to-r from-[#2563EB]/10 to-[#1E40AF]/10 rounded-xl w-full transition-all duration-300"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar