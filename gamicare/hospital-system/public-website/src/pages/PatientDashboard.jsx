import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUserMd, 
  FaBell, 
  FaPlus, 
  FaHistory,
  FaFileMedical,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaUserInjured,
  FaChevronRight,
  FaDownload,
  FaEye,
  FaTimesCircle,
  FaVideo,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcoming: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const appointmentsRes = await axios.get('http://localhost:5001/api/appointments/patient', config);
      const appData = appointmentsRes.data.data || appointmentsRes.data || [];
      
      setAppointments(appData);

      const total = appData.length;
      const upcoming = appData.filter(a => 
        new Date(a.date) > new Date() && a.status === 'approved'
      ).length;
      const completed = appData.filter(a => 
        a.status === 'completed'
      ).length;
      const pending = appData.filter(a => 
        a.status === 'pending'
      ).length;

      setStats({
        totalAppointments: total,
        upcoming,
        completed,
        pending
      });

      setNotifications([
        { id: 1, title: 'Appointment Reminder', message: 'Your appointment with Dr. Sarah is tomorrow at 10:30 AM', time: '2 hours ago', read: false },
        { id: 2, title: 'Prescription Ready', message: 'Your prescription has been updated', time: '1 day ago', read: true },
        { id: 3, title: 'Test Results', message: 'Lab results are available for download', time: '2 days ago', read: false },
      ]);

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-300 border border-yellow-500/20">Pending</span>;
      case 'approved': 
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#16C79A]/20 to-[#16C79A]/10 text-[#16C79A] border border-[#16C79A]/20">Approved</span>;
      case 'cancelled': 
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-300 border border-red-500/20">Cancelled</span>;
      case 'completed': 
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#11698E]/20 to-[#11698E]/10 text-[#11698E] border border-[#16C79A]/20">Completed</span>;
      default: 
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900/20 text-gray-300 border border-gray-500/20">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return 'Invalid Date';
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16C79A]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6  min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="text-[#16C79A]">{user?.name?.split(' ')[0]}!</span>
            </h1>
            <p className="text-[#16C79A]/80 mt-2">Here's your healthcare overview</p>
          </div>
          <Link 
            to="/patient/book-appointment" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#16C79A] to-[#11698E] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 border border-[#16C79A]/30 hover:scale-[1.02]"
          >
            <FaPlus />
            Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Appointments */}
        <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Total Appointments</p>
              <h3 className="text-3xl font-bold mt-2 text-white">{stats.totalAppointments}</h3>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#16C79A]/20 to-[#16C79A]/10 rounded-xl border border-[#16C79A]/20">
              <FaCalendarAlt className="text-2xl text-[#16C79A]" />
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Upcoming</p>
              <h3 className="text-3xl font-bold mt-2 text-[#16C79A]">{stats.upcoming}</h3>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#16C79A]/20 to-[#16C79A]/10 rounded-xl border border-[#16C79A]/20">
              <FaClock className="text-2xl text-[#16C79A]" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Completed</p>
              <h3 className="text-3xl font-bold mt-2 text-[#11698E]">{stats.completed}</h3>
            </div>
            <div className="p-4 bg-gradient-to-br from-[#11698E]/20 to-[#11698E]/10 rounded-xl border border-[#16C79A]/20">
              <FaCheckCircle className="text-2xl text-[#11698E]" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-yellow-500/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Pending</p>
              <h3 className="text-3xl font-bold mt-2 text-yellow-400">{stats.pending}</h3>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl border border-yellow-500/20">
              <FaExclamationTriangle className="text-2xl text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 overflow-hidden">
            <div className="p-6 border-b border-[#16C79A]/20 bg-gradient-to-r from-[#19456B] to-[#0d2c4a]/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
                  <p className="text-sm text-[#16C79A]/80 mt-1">Your scheduled visits</p>
                </div>
                <Link 
                  to="/patient/appointments" 
                  className="inline-flex items-center gap-2 text-[#16C79A] hover:text-white text-sm font-medium transition-colors"
                >
                  View All
                  <FaChevronRight size={12} />
                </Link>
              </div>
            </div>

            {appointments.filter(a => a.status === 'approved' && new Date(a.date) > new Date()).length > 0 ? (
              <div className="p-6">
                <div className="space-y-4">
                  {appointments
                    .filter(a => a.status === 'approved' && new Date(a.date) > new Date())
                    .slice(0, 3)
                    .map((appointment) => (
                      <div 
                        key={appointment._id} 
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-[#19456B]/50 to-[#0d2c4a]/50 border border-[#16C79A]/20 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-[#16C79A]/20 to-[#11698E]/10 rounded-xl border border-[#16C79A]/20">
                            <FaUserMd className="text-xl text-[#16C79A]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">
                              {appointment.doctorId?.name || 'Doctor'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-[#16C79A]/80 mt-1">
                              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] px-2 py-1 rounded border border-[#16C79A]/20">
                                <FaCalendarAlt size={12} />
                                {formatDate(appointment.date)}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] px-2 py-1 rounded border border-[#16C79A]/20">
                                <FaClock size={12} />
                                {appointment.time}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] px-2 py-1 rounded border border-[#16C79A]/20">
                                <FaMapMarkerAlt size={12} />
                                Room {appointment.doctorId?.roomNumber || 'N/A'}
                              </span>
                            </div>
                            <div className="mt-2">
                              {getStatusBadge(appointment.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link 
                            to={`/patient/appointments`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 text-white text-sm font-medium rounded-lg hover:shadow-md border border-[#16C79A]/30 hover:border-[#16C79A]"
                          >
                            View Details
                          </Link>
                          {appointment.type === 'Virtual' && appointment.roomID && (
                            <Link 
                              to={`/patient/consultation/${appointment.roomID}`}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-lg hover:shadow-lg animate-pulse"
                            >
                              <FaVideo size={14} />
                              Join Video Call
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-[#16C79A]/30 text-5xl mb-4">📅</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  No upcoming appointments
                </h4>
                <p className="text-[#16C79A]/80 mb-4">
                  Book your next appointment with our expert doctors
                </p>
                <Link to="/patient/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#16C79A] to-[#11698E] text-white font-medium rounded-xl hover:shadow-lg border border-[#16C79A]/30">
                  <FaPlus />
                  Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 overflow-hidden">
            <div className="p-6 border-b border-[#16C79A]/20 bg-gradient-to-r from-[#19456B] to-[#0d2c4a]/50">
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link
                  to="/patient/book-appointment"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#16C79A]/10 to-[#16C79A]/5 text-white rounded-xl hover:shadow-md transition-all duration-200 group border border-[#16C79A]/20 hover:border-[#16C79A] hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] rounded-lg group-hover:bg-gradient-to-r group-hover:from-[#16C79A] group-hover:to-[#11698E] group-hover:text-white transition-all border border-[#16C79A]/20">
                      <FaPlus className="text-[#16C79A] group-hover:text-white" />
                    </div>
                    <span className="font-medium">Book New Appointment</span>
                  </div>
                  <FaChevronRight className="text-[#16C79A] group-hover:text-white" />
                </Link>
                <Link
                  to="/patient/profile"
                  className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 text-white rounded-xl hover:shadow-md transition-all duration-200 group border border-[#16C79A]/20 hover:border-[#16C79A] hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] rounded-lg group-hover:bg-gradient-to-r group-hover:from-[#16C79A] group-hover:to-[#11698E] group-hover:text-white transition-all border border-[#16C79A]/20">
                      <FaUserInjured className="text-[#16C79A] group-hover:text-white" />
                    </div>
                    <span className="font-medium">Update Profile</span>
                  </div>
                  <FaChevronRight className="text-[#16C79A]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Medical Records Summary */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-emerald-500/20 overflow-hidden">
            <div className="p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-900/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <FaFileMedical className="text-xl text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Medical Records</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-[#0d2c4a]/50 rounded-lg border border-emerald-500/10">
                  <span className="text-white/70">Total Appointments</span>
                  <span className="text-2xl font-bold text-white">{stats.totalAppointments}</span>
                </div>
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-400 font-bold rounded-xl hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-emerald-600/20 transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40"
                >
                  <FaHistory />
                  View Medical History
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-red-500/20 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-red-900/20 to-transparent">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-red-400 text-2xl animate-pulse">🚨</div>
                <div>
                  <h3 className="font-bold text-red-300">Emergency Contact</h3>
                  <div className="w-12 h-1 bg-red-500/30 rounded-full mt-1"></div>
                </div>
              </div>
              <p className="text-red-400 mb-4 text-sm">
                For life-threatening emergencies, call immediately:
              </p>
              <a 
                href="tel:+252611234567" 
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 border border-red-500/30 hover:scale-[1.02] animate-pulse hover:animate-none"
              >
                <FaTimesCircle className="animate-pulse" />
                +252 61 123 4567
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 mt-6 overflow-hidden">
        <div className="p-6 border-b border-[#16C79A]/20 bg-gradient-to-r from-[#19456B] to-[#0d2c4a]/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Recent Appointments</h2>
              <p className="text-sm text-[#16C79A]/80 mt-1">All your appointments at a glance</p>
            </div>
            <Link 
              to="/patient/appointments" 
              className="inline-flex items-center gap-2 text-[#16C79A] hover:text-white text-sm font-medium transition-colors"
            >
              View All
              <FaChevronRight size={12} />
            </Link>
          </div>
        </div>
        
        {appointments.length > 0 ? (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#16C79A]/20">
                    <th className="text-left py-3 px-4 text-white font-bold">Doctor</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Date & Time</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Status</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment._id} className="border-b border-[#16C79A]/10 hover:bg-gradient-to-r hover:from-[#19456B]/50 hover:to-[#0d2c4a]/50 transition-all duration-200">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{appointment.doctorId?.name || 'Doctor'}</div>
                        <div className="text-sm text-[#16C79A]">{appointment.doctorId?.specialization || 'Specialization'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{formatDate(appointment.date)}</div>
                        <div className="text-sm text-[#16C79A]/80">{appointment.time}</div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#16C79A]/10 to-[#16C79A]/5 text-[#16C79A] text-sm font-medium rounded-lg hover:shadow-md border border-[#16C79A]/20 hover:border-[#16C79A]">
                            <FaEye size={12} />
                            View
                          </button>
                          {appointment.status === 'pending' && (
                            <button className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-300 text-sm font-medium rounded-lg hover:shadow-md border border-red-500/20 hover:border-red-400">
                              <FaTimesCircle size={12} />
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaCalendarCheck className="text-5xl text-[#16C79A]/30 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              No appointments yet
            </h4>
            <p className="text-[#16C79A]/80 mb-4">
              Book your first appointment with our expert doctors
            </p>
            <Link to="/patient/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#16C79A] to-[#11698E] text-white font-medium rounded-xl hover:shadow-lg border border-[#16C79A]/30">
              <FaPlus />
              Book Appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;