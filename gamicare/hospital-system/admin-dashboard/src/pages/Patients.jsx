import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/admin/patients');
      setPatients(response.data);
    } catch (error) {
      toast.error('Failed to load patients');
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/patients/${patientId}`);
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      toast.error('Failed to delete patient');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone?.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 dark:border-white/5 border-t-[#1e40af] mb-4"></div>
        <p className="text-gray-400 font-medium animate-pulse">Loading patient records...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          Patients <span className="text-[#1e40af] dark:text-blue-400">Management</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage and monitor all patient records</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Patients', value: patients.length, icon: FaUser, color: 'blue' },
          { 
            label: 'Active Today', 
            value: patients.filter(p => {
              const today = new Date().toISOString().split('T')[0];
              return p.lastLogin && p.lastLogin.split('T')[0] === today;
            }).length, 
            icon: FaCalendarAlt, 
            color: 'emerald' 
          },
          { 
            label: 'New This Month', 
            value: patients.filter(p => {
              const month = new Date().getMonth();
              const year = new Date().getFullYear();
              const patientDate = new Date(p.createdAt);
              return patientDate.getMonth() === month && patientDate.getFullYear() === year;
            }).length, 
            icon: FaUser, 
            color: 'indigo' 
          },
          { 
            label: 'Total Sessions', 
            value: patients.reduce((acc, patient) => acc + (patient.appointmentCount || 0), 0), 
            icon: FaCalendarAlt, 
            color: 'amber' 
          }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Search Directory</label>
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e40af] transition-colors" />
              <input
                type="text"
                placeholder="Name, email, or phone..."
                className="input pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Account Status</label>
            <div className="relative group">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e40af] transition-colors" />
              <select
                className="input pl-12 appearance-none cursor-pointer"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Patients</option>
                <option value="active">Active Members</option>
                <option value="inactive">Inactive Members</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Sort Order</label>
            <select className="input appearance-none cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">Name (A-Z)</option>
              <option value="za">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card !p-0 overflow-hidden shadow-xl border-gray-100 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Patient Profile</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact Access</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Registration Info</th>
                <th className="text-center py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {currentPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
                        {patient.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#1e40af] transition-colors">{patient.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">REF: {patient._id?.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <FaEnvelope className="text-[#1e40af] opacity-50 text-xs" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaPhone className="text-[#1e40af] opacity-50 text-xs" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{patient.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="space-y-1.5">
                      <div className="text-sm">
                        <span className="font-bold text-gray-900 dark:text-white">{formatDate(patient.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-success !text-[10px] !px-2 !py-0.5">ACTIVE</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2.5 bg-blue-50 dark:bg-blue-900/10 text-[#1e40af] dark:text-blue-400 hover:bg-[#1e40af] hover:text-white rounded-xl transition-all" title="View Profile">
                        <FaEye size={14} />
                      </button>
                      <button className="p-2.5 bg-blue-50 dark:bg-blue-900/10 text-[#1e40af] dark:text-blue-400 hover:bg-[#1e40af] hover:text-white rounded-xl transition-all" title="Edit Patient">
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Delete Record"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentPatients.length === 0 && (
          <div className="text-center py-20 bg-gray-50/30 dark:bg-white/2">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-4xl text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No results matching your query</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-sm">We couldn't find any patients matching your search criteria. Try broadening your terms.</p>
          </div>
        )}

        {/* Pagination Section */}
        {filteredPatients.length > patientsPerPage && (
          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing <span className="text-gray-900 dark:text-white">{indexOfFirstPatient + 1}</span> to <span className="text-gray-900 dark:text-white">{Math.min(indexOfLastPatient, filteredPatients.length)}</span> of <span className="text-gray-900 dark:text-white">{filteredPatients.length}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary !py-2 !text-xs !rounded-lg disabled:opacity-30"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        currentPage === number 
                          ? 'bg-[#1e40af] text-white shadow-lg shadow-blue-500/30' 
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary !py-2 !text-xs !rounded-lg disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;