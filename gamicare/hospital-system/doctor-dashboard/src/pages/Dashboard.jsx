import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Bell,
  User,
  Activity,
  Stethoscope,
  MapPin
} from 'lucide-react'
import { appointmentService } from '../services/appointmentService'
import { notificationService } from '../services/notificationService'
import { useAuth } from '../contexts/AuthContext'
import AppointmentList from '../components/appointments/AppointmentList'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    pending: 0,
    approved: 0,
    cancelled: 0
  })
  const [todayAppointments, setTodayAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to fetch today's appointments
      let todayData = []
      try {
        todayData = await appointmentService.getTodayAppointments()
      } catch (todayError) {
        console.log('Could not fetch today appointments, using fallback')
        // Fallback to all appointments and filter by today
        const allAppointments = await appointmentService.getDoctorAppointments()
        const today = new Date().toDateString()
        todayData = allAppointments.filter(apt => 
          new Date(apt.date).toDateString() === today
        )
      }
      
      setTodayAppointments(todayData || [])

      // Fetch all appointments for stats
      const appointments = await appointmentService.getDoctorAppointments()
      
      const today = new Date().toDateString()
      const todayCount = appointments.filter(apt => 
        new Date(apt.date).toDateString() === today
      ).length

      const upcomingCount = appointments.filter(apt => 
        new Date(apt.date) > new Date() && apt.status === 'approved'
      ).length

      setStats({
        today: todayCount,
        upcoming: upcomingCount,
        pending: appointments.filter(a => a.status === 'pending').length,
        approved: appointments.filter(a => a.status === 'approved').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length
      })

      // Fetch notifications
      const notifData = await notificationService.getNotifications({ limit: 5 })
      setNotifications(notifData.notifications || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
      
      // Set default values
      setStats({
        today: 0,
        upcoming: 0,
        pending: 0,
        approved: 0,
        cancelled: 0
      })
      setTodayAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Today',
      value: stats.today,
      icon: CalendarDays,
      color: 'from-[#16C79A] to-[#11698E]',
      link: '/appointments?filter=today'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming,
      icon: Clock,
      color: 'from-green-500 to-emerald-600',
      link: '/appointments?filter=upcoming'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: AlertCircle,
      color: 'from-yellow-500 to-amber-600',
      link: '/appointments?status=pending'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'from-[#16C79A] to-[#11698E]',
      link: '/appointments?status=approved'
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      link: '/appointments?status=cancelled'
    }
  ]

  if (loading) return <LoadingSpinner />
  
  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-[#19456B] to-[#0d2c4a] min-h-screen">
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-700/50 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-300 mb-4">Error Loading Dashboard</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-[#16C79A] to-[#11698E] text-white rounded-xl hover:opacity-90 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-[#19456B] to-[#0d2c4a] min-h-screen">
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-[#16C79A] to-[#11698E] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-3">
              Welcome back, Dr. {user?.name}!
            </h1>
            <p className="text-lg opacity-90">
              You have <span className="font-bold">{stats.today}</span> appointment{stats.today !== 1 ? 's' : ''} scheduled for today
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/20">
            <Stethoscope className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] border border-[#16C79A]/20 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#16C79A]/80">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] border border-[#16C79A]/20 rounded-2xl shadow-xl mb-8">
        <div className="p-6 border-b border-[#16C79A]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-[#16C79A]" />
              <h2 className="text-xl font-semibold text-white">
                Today's Schedule
              </h2>
            </div>
            <Link
              to="/schedule"
              className="text-[#16C79A] hover:text-white text-sm font-medium transition-colors"
            >
              View Full Schedule →
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment._id} className="bg-gradient-to-r from-[#11698E]/10 to-[#19456B]/10 p-4 rounded-xl border border-[#16C79A]/20 hover:from-[#11698E]/20 hover:to-[#19456B]/20 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{appointment.patientId?.name}</h3>
                      <p className="text-sm text-[#16C79A]/80">{appointment.time} • {appointment.symptoms?.slice(0, 50)}...</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          appointment.paymentStatus === 'paid' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-300 border-red-500/20'
                        }`}>
                          {appointment.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#16C79A]/80">
                          <MapPin size={10} />
                          Room {user?.roomNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'approved' ? 'bg-gradient-to-r from-[#16C79A]/20 to-[#11698E]/20 text-[#16C79A]' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-[#16C79A]/30 mx-auto mb-4" />
              <p className="text-gray-300">No appointments scheduled for today</p>
              <Link 
                to="/availability" 
                className="inline-block mt-4 text-[#16C79A] hover:text-white transition-colors"
              >
                Set your availability
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] border border-[#16C79A]/20 rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-6 w-6 text-[#16C79A]" />
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-4">
            <Link
              to="/availability"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#16C79A]/20 to-[#11698E]/20 group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4 text-[#16C79A]" />
              </div>
              <div>
                <p className="font-medium text-white">Set Availability</p>
                <p className="text-sm text-[#16C79A]/70">Update your working hours</p>
              </div>
            </Link>
            
            <Link
              to="/appointments"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#16C79A]/20 to-[#11698E]/20 group-hover:scale-110 transition-transform">
                <Calendar className="h-4 w-4 text-[#16C79A]" />
              </div>
              <div>
                <p className="font-medium text-white">All Appointments</p>
                <p className="text-sm text-[#16C79A]/70">View and manage appointments</p>
              </div>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#16C79A]/20 to-[#11698E]/20 group-hover:scale-110 transition-transform">
                <User className="h-4 w-4 text-[#16C79A]" />
              </div>
              <div>
                <p className="font-medium text-white">Update Profile</p>
                <p className="text-sm text-[#16C79A]/70">Edit your professional details</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Notifications Preview */}
        <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] border border-[#16C79A]/20 rounded-2xl shadow-xl p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-[#16C79A]" />
              <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
            </div>
            <Link
              to="/notifications"
              className="text-[#16C79A] hover:text-white text-sm font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif._id} className={`bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 p-4 rounded-xl border border-[#16C79A]/20 ${notif.isRead ? 'opacity-70' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#16C79A]/20 to-[#11698E]/20">
                      {notif.type === 'appointment' ? <Calendar className="h-5 w-5 text-[#16C79A]" /> : <Bell className="h-5 w-5 text-[#16C79A]" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{notif.title}</p>
                      <p className="text-sm text-[#16C79A]/80 mt-1">{notif.message}</p>
                      <p className="text-xs text-[#16C79A]/60 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                    {!notif.isRead && (
                      <button 
                        onClick={async () => {
                          await notificationService.markAsRead(notif._id);
                          fetchDashboardData();
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-[#16C79A] to-[#11698E] text-white text-xs rounded-lg hover:opacity-90 transition-all font-bold"
                      >
                        Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Bell className="h-12 w-12 text-[#16C79A]/30 mx-auto mb-2" />
                <p className="text-gray-400">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;