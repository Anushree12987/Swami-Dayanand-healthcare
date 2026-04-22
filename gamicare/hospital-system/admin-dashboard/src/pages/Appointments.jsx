import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaUserMd, FaUser, FaClock, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaDollarSign } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      fetchDashboardStats();
    }
  }, [appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/admin/appointments');
      if (response.data && response.data.appointments) {
        setAppointments(response.data.appointments);
      } else if (Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      toast.error('Failed to load appointments');
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const appointmentsArray = Array.isArray(appointments) ? appointments : [];
      const todayAppointmentsList = appointmentsArray.filter(app => {
        if (!app.date) return false;
        const appointmentDate = new Date(app.date).toISOString().split('T')[0];
        return appointmentDate === todayStr;
      });
      
      const todayRevenue = todayAppointmentsList.reduce((total, app) => {
        if (app.status === 'approved' || app.status === 'completed') {
          return total + (app.amount || 500);
        }
        return total;
      }, 0);
      
      setStats({
        totalAppointments: appointmentsArray.length,
        pendingAppointments: appointmentsArray.filter(a => a.status === 'pending').length,
        todayAppointments: todayAppointmentsList.length,
        todayRevenue: todayRevenue
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    setProcessingId(appointmentId);
    try {
      await api.patch(`/admin/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      toast.success(`Appointment ${newStatus} successfully`);
      await fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment record?')) return;
    
    console.log(`[FRONTEND DELETE] Deleting ID: ${appointmentId}`);
    setProcessingId(appointmentId);
    try {
      await api.delete(`/admin/appointments/${appointmentId}`);
      
      // OPTIMISTIC UI: Remove from state immediately to show feedback
      setAppointments(prev => prev.filter(app => app._id !== appointmentId));
      
      toast.success('Appointment record deleted successfully');
    } catch (error) {
      console.error(`[FRONTEND DELETE] Error details:`, error);
      const errorMsg = error.response?.data?.message || 'Connection failed or server busy';
      alert(`DELETE FAILED: ${errorMsg}\n\nPlease check your backend terminal for [ADMIN DELETE] logs.`);
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const appointmentsArray = Array.isArray(appointments) ? appointments : [];

  const filteredAppointments = appointmentsArray.filter(appointment => {
    const patientName = appointment.patientId?.name || '';
    const doctorName = appointment.doctorId?.name || '';
    const symptoms = appointment.symptoms || '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
    
    const matchesDate = !selectedDate || 
      (appointment.date && new Date(appointment.date).toISOString().split('T')[0] === selectedDate);
    
    const matchesDoctor = !selectedDoctor || doctorName === selectedDoctor;
    
    return matchesSearch && matchesStatus && matchesDate && matchesDoctor;
  });

  const uniqueDoctorNames = [...new Set(
    appointmentsArray
      .map(a => a.doctorId?.name)
      .filter(name => name && name.trim() !== '')
  )];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 dark:border-white/5 border-t-[#1e40af] mb-4"></div>
        <p className="text-gray-400 font-medium animate-pulse">Synchronizing appointments...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          Appointment <span className="text-[#1e40af] dark:text-blue-400">Scheduler</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Full clinical cycle management and monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Scheduled', value: stats.totalAppointments, icon: FaCalendarAlt, color: 'blue' },
          { label: 'Pending Review', value: stats.pendingAppointments, icon: FaClock, color: 'amber' },
          { label: 'Today Traffic', value: stats.todayAppointments, icon: FaCalendarAlt, color: 'indigo' },
          { label: 'Daily Revenue', value: formatCurrency(stats.todayRevenue), icon: FaDollarSign, color: 'emerald' }
        ].map((item, idx) => (
          <div key={idx} className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{item.value}</h3>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-white/5 text-[#1e40af] dark:text-blue-400 rounded-xl group-hover:bg-[#1e40af] group-hover:text-white transition-all">
                <item.icon className="text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <label className="label">Search Registry</label>
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e40af] transition-colors" />
              <input
                type="text"
                placeholder="Patient, doctor, symptoms..."
                className="input pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Status Filter</label>
            <div className="relative group">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e40af] transition-colors" />
              <select
                className="input pl-12 cursor-pointer appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Appointments</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved Only</option>
                <option value="completed">Completed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Specific Date</label>
            <input
              type="date"
              className="input cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Doctor Assigned</label>
            <select 
              className="input cursor-pointer appearance-none"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">All Medical Staff</option>
              {uniqueDoctorNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card !p-0 overflow-hidden shadow-xl border-gray-100 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Client & Consultant</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Schedule Details</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Clinical State</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Financials</th>
                <th className="text-center py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredAppointments.map((appointment) => {
                const appointmentDate = appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : null;
                const today = new Date().toISOString().split('T')[0];
                const isToday = appointmentDate === today;
                
                return (
                  <tr key={appointment._id} className={`hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-[#1e40af] dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-[10px]">
                            <FaUser />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{appointment.patientId?.name || 'N/A'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Patient</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-[10px]">
                            <FaUserMd />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">Dr. {appointment.doctorId?.name || 'N/A'}</p>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{appointment.doctorId?.specialization || 'Clinical Staff'}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-[#1e40af] opacity-40 text-sm" />
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="text-[#1e40af] opacity-40 text-sm" />
                          <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">{appointment.time || 'N/A'}</span>
                        </div>
                        {isToday && (
                          <span className="inline-block px-2 py-0.5 text-[9px] font-black bg-blue-100 dark:bg-blue-900/20 text-[#1e40af] dark:text-blue-400 rounded border border-blue-200 dark:border-blue-800/30 uppercase tracking-widest">
                            Scheduled Today
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className={`font-black tracking-tight ${(appointment.status === 'approved' || appointment.status === 'completed') ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                          {formatCurrency(appointment.amount || 500)}
                        </span>
                        {(appointment.status === 'approved' || appointment.status === 'completed') && (
                          <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider mt-1">Confirmed Revenue</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailModal(true);
                          }}
                          className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-[#1e40af] hover:text-white rounded-xl transition-all" 
                          title="View Dossier"
                        >
                          <FaEye size={14} />
                        </button>
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment._id, 'approved')}
                              disabled={processingId === appointment._id}
                              className="p-2.5 bg-blue-50 dark:bg-blue-900/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all disabled:opacity-50"
                              title="Authorize"
                            >
                              {processingId === appointment._id ? (
                                <div className="h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FaCheck size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                              disabled={processingId === appointment._id}
                              className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50"
                              title="Reject"
                            >
                              <FaTimes size={14} />
                            </button>
                          </>
                        )}
                        {(appointment.status === 'approved') && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                            disabled={processingId === appointment._id}
                            className="p-2.5 bg-green-50 dark:bg-green-900/10 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all disabled:opacity-50"
                            title="Complete Cycle"
                          >
                            {processingId === appointment._id ? (
                               <div className="h-3.5 w-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FaCheck size={14} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAppointment(appointment._id)}
                          disabled={processingId === appointment._id}
                          className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Purge Record"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-20 bg-gray-50/30 dark:bg-white/2">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
              <FaCalendarAlt className="text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No appointments record found</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-sm">Update your search filters or try a different date range to see results.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">Case Dossier</span>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-400"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1e40af] to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                  <FaUser />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{selectedAppointment.patientId?.name || 'N/A'}</h2>
                  <p className="text-gray-500 font-medium text-sm">{selectedAppointment.patientId?.email || 'No email recorded'}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Clinical Staff</label>
                  <div className="flex items-center gap-2">
                    <FaUserMd className="text-indigo-500" />
                    <span className="font-bold text-gray-900 dark:text-white">Dr. {selectedAppointment.doctorId?.name || 'Unassigned'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Schedule</label>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500" />
                    <span className="font-bold text-gray-900 dark:text-white">{formatDate(selectedAppointment.date)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Presenting Symptoms</label>
                <div className="p-4 bg-gray-50 dark:bg-white/2 rounded-2xl text-gray-500 dark:text-gray-400 font-medium text-sm italic border border-gray-100 dark:border-white/5">
                  "{selectedAppointment.symptoms || 'No symptoms reported by patient.'}"
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1e40af]/5 dark:bg-blue-400/5 rounded-2xl border border-[#1e40af]/10 dark:border-blue-400/10">
                <div>
                  <label className="text-[10px] font-black text-[#1e40af] dark:text-blue-400 uppercase tracking-widest mb-0.5 block">Service Fee</label>
                  <span className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(selectedAppointment.amount)}</span>
                </div>
                <div className="text-right">
                   <label className="text-[10px] font-black text-[#1e40af] dark:text-blue-400 uppercase tracking-widest mb-0.5 block">Payment</label>
                   <span className="text-xs font-bold text-emerald-500 uppercase">{selectedAppointment.paymentStatus || 'Pending'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50/50 dark:bg-white/2 text-center">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="btn btn-primary w-full py-4 text-xs font-black uppercase tracking-widest"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;