import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaUserMd,
  FaCalendarCheck,
  FaDollarSign,
  FaClock,
  FaUserInjured,
  FaCalendarTimes,
  FaSync,
  FaChartLine,
  FaCalendarAlt
} from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    cancelledAppointments: 0,
    completedAppointments: 0,
    todayRevenue: 0,
    totalRevenue: 0
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data);

      const appointmentsResponse = await api.get('/admin/appointments/recent');
      setRecentAppointments(appointmentsResponse.data || []);
      
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const appointmentsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments',
        data: [12, 19, 8, 15, 22, 18, 10],
        backgroundColor: '#1e40af',
        borderRadius: 8,
        hoverBackgroundColor: '#1d4ed8',
      }
    ],
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="badge badge-info shadow-sm">Approved</span>;
      case 'pending': return <span className="badge badge-warning shadow-sm">Pending</span>;
      case 'completed': return <span className="badge badge-success shadow-sm">Completed</span>;
      case 'cancelled': return <span className="badge badge-danger shadow-sm">Cancelled</span>;
      default: return <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 dark:border-white/5 border-t-[#1e40af] mb-4"></div>
        <p className="text-gray-400 font-medium animate-pulse">Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl text-center max-w-2xl mx-auto my-12 transition-all">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaCalendarTimes className="text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="btn btn-primary mx-auto"
        >
          <FaSync className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Dashboard <span className="text-[#1e40af] dark:text-blue-400">Overview</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
            Professional healthcare management system
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-green-500 font-bold uppercase tracking-wider">Live System</span>
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="btn btn-secondary shadow-sm"
        >
          <FaSync className="text-sm" /> 
          <span className="hidden sm:inline">Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Patients', value: stats.totalPatients, icon: FaUsers, color: 'blue', desc: 'Active records' },
          { label: 'Total Doctors', value: stats.totalDoctors, icon: FaUserMd, color: 'indigo', desc: 'Specialists' },
          { label: 'Today Appts', value: stats.todayAppointments, icon: FaClock, color: 'emerald', desc: 'Scheduled today' },
          { label: 'Today Revenue', value: formatCurrency(stats.todayRevenue), icon: FaDollarSign, color: 'green', desc: 'Daily earnings' }
        ].map((item, idx) => (
          <div key={idx} className="stat-card group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1e40af]/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{item.value}</h3>
                <p className="text-[11px] font-bold text-[#1e40af] dark:text-blue-400 opacity-80 uppercase tracking-wider">{item.desc}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-white/5 text-[#1e40af] dark:text-blue-400 rounded-xl transition-colors group-hover:bg-[#1e40af] group-hover:text-white">
                <item.icon className="text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Appointment Trends</h3>
              <p className="text-xs text-gray-400">Weekly patient traffic analysis</p>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-[#1e40af] dark:text-blue-400 rounded-lg">
              <FaChartLine className="text-lg" />
            </div>
          </div>
          <div className="h-64">
            <Bar 
              data={appointmentsData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    cornerRadius: 12,
                    displayColors: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8', font: { size: 11 } },
                    grid: { color: 'rgba(148, 163, 184, 0.05)' }
                  },
                  x: {
                    ticks: { color: '#94a3b8', font: { size: 11 } },
                    grid: { display: false }
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Status Distribution</h3>
              <p className="text-xs text-gray-400">Current appointment state breakdown</p>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-[#1e40af] dark:text-blue-400 rounded-lg">
              <FaCalendarAlt className="text-lg" />
            </div>
          </div>
          <div className="h-64">
            <Pie 
              data={{
                labels: ['Approved', 'Pending', 'Completed', 'Cancelled'],
                datasets: [{
                  data: [
                    stats.approvedAppointments,
                    stats.pendingAppointments,
                    stats.completedAppointments,
                    stats.cancelledAppointments
                  ],
                  backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
                  borderWidth: 0,
                  hoverOffset: 20
                }]
              }} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'circle',
                      color: '#94a3b8',
                      font: { size: 11, weight: '600' },
                      padding: 20
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card !p-0 overflow-hidden mb-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Recent Activity</h3>
            <p className="text-xs text-gray-400">Latest 5 appointment updates</p>
          </div>
          <button 
            className="text-sm font-bold text-[#1e40af] dark:text-blue-400 hover:underline flex items-center gap-1"
            onClick={() => navigate('/appointments')}
          >
            View All <FaSync className="text-[10px]" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5">
                <th className="text-left py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Patient Details</th>
                <th className="text-left py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Consulting Doctor</th>
                <th className="text-left py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Schedule Info</th>
                <th className="text-left py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {recentAppointments.slice(0, 5).map((appointment) => (
                <tr 
                  key={appointment._id} 
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 text-[#1e40af] dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">
                        {appointment.patientId?.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-[#1e40af] transition-colors">{appointment.patientId?.name || 'N/A'}</div>
                        <div className="text-[11px] text-gray-400 font-medium">{appointment.patientId?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 dark:text-white text-sm">Dr. {appointment.doctorId?.name || 'N/A'}</div>
                    <div className="text-[11px] text-[#1e40af] dark:text-blue-400 font-bold uppercase tracking-wider">{appointment.doctorId?.specialization || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 dark:text-white text-sm">{formatDate(appointment.date)}</div>
                    <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 uppercase">
                      <FaClock className="text-[#1e40af]" /> {appointment.time || 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(appointment.status)}
                  </td>
                </tr>
              ))}
              
              {recentAppointments.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <FaCalendarTimes className="text-4xl" />
                      <p className="font-bold uppercase tracking-widest text-sm">No recent activity detected</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Approved', value: stats.approvedAppointments, icon: FaCalendarCheck, color: 'blue', desc: 'Confirmed activity' },
          { label: 'Pending', value: stats.pendingAppointments, icon: FaUserInjured, color: 'amber', desc: 'Awaiting review' },
          { label: 'Completed', value: stats.completedAppointments, icon: FaCalendarCheck, color: 'emerald', desc: 'Finished cycles' },
          { label: 'Cancelled', value: stats.cancelledAppointments, icon: FaCalendarTimes, color: 'rose', desc: 'Nullified sessions' }
        ].map((item, idx) => (
          <div key={idx} className="card group hover:border-[#1e40af]/30 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/10 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                <item.icon className="text-2xl" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;