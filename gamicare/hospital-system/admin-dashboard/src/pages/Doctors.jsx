import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaUserMd, 
  FaFilter, FaEye, FaPhone, FaEnvelope, FaCalendarAlt,
  FaTimes, FaCheck, FaClock, FaUserInjured, FaUpload
} from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const fileInputRef = React.useRef(null);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    phone: '',
    availableTime: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }]
  });

  const [editDoctor, setEditDoctor] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: '',
    status: 'active',
    availableTime: []
  });

  const [specializations, setSpecializations] = useState([]);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/doctors');
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/admin/departments');
      const activeDepts = response.data
        .filter(dept => dept.isActive)
        .map(dept => dept.name);
      setSpecializations(activeDepts);
    } catch (error) {
      console.error('Failed to load specializations');
    }
  };

  const fetchDoctorDetails = async (doctorId) => {
    try {
      const response = await api.get(`/admin/doctors/${doctorId}`);
      setEditDoctor({
        name: response.data.name,
        email: response.data.email,
        specialization: response.data.specialization || '',
        phone: response.data.phone || '',
        status: response.data.isActive ? 'active' : 'inactive',
        availableTime: response.data.availableTime || [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }]
      });
    } catch (error) {
      toast.error('Failed to load doctor details');
    }
  };

  const fetchDoctorAppointments = async (doctorId) => {
    try {
      setLoadingAppointments(true);
      const response = await api.get(`/appointments/doctor/${doctorId}`);
      setDoctorAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleViewDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
    await fetchDoctorAppointments(doctor._id);
  };

  const handleEditDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    await fetchDoctorDetails(doctor._id);
    setShowEditModal(true);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/doctors/${selectedDoctor._id}`, editDoctor);
      toast.success('Doctor updated successfully');
      setShowEditModal(false);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  const handleStatusToggle = async (doctorId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/admin/doctors/${doctorId}/status`, { status: newStatus });
      toast.success(`Doctor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm('Delete this record permanently?')) return;
    try {
      await api.delete(`/admin/doctors/${doctorId}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/doctors', newDoctor);
      toast.success('Doctor added successfully');
      setShowAddModal(false);
      setNewDoctor({
        name: '', email: '', password: '', specialization: '', phone: '',
        availableTime: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }]
      });
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploadingCSV(true);
      await api.post('/admin/doctors/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Doctors imported successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to import CSV');
    } finally {
      setUploadingCSV(false);
    }
  };

  const addAvailableTimeSlot = () => {
    setEditDoctor({
      ...editDoctor,
      availableTime: [...editDoctor.availableTime, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]
    });
  };

  const removeAvailableTimeSlot = (index) => {
    const updatedTimeSlots = [...editDoctor.availableTime];
    updatedTimeSlots.splice(index, 1);
    setEditDoctor({ ...editDoctor, availableTime: updatedTimeSlots });
  };

  const updateTimeSlot = (index, field, value) => {
    const updatedTimeSlots = [...editDoctor.availableTime];
    updatedTimeSlots[index][field] = value;
    setEditDoctor({ ...editDoctor, availableTime: updatedTimeSlots });
  };

  const filteredDoctors = doctors.filter(doctor => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = doctor.name?.toLowerCase().includes(query) ||
                         doctor.specialization?.toLowerCase().includes(query) ||
                         doctor.email?.toLowerCase().includes(query);
    const matchesSpec = selectedSpecialization === 'all' || doctor.specialization === selectedSpecialization;
    const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'active' ? doctor.isActive : !doctor.isActive);
    return matchesSearch && matchesSpec && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 dark:border-white/5 border-t-[#1e40af] mb-4"></div>
        <p className="text-gray-400 font-medium animate-pulse">Accessing medical directory...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Medical <span className="text-[#1e40af] dark:text-blue-400">Staff</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Configure and manage clinical Doctors</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingCSV}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FaUpload size={14} />
            {uploadingCSV ? 'Importing...' : 'Batch Import'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FaPlus size={14} /> Add Doctor
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="label">Search Registry</label>
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e40af] transition-colors" />
              <input
                type="text"
                placeholder="Name, specialization, or email..."
                className="input pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="label">Specialization</label>
            <select
              className="input cursor-pointer appearance-none"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <option value="all">All Specialties</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Availability Status</label>
            <select
              className="input cursor-pointer appearance-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Duty</option>
              <option value="inactive">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card !p-0 overflow-hidden shadow-xl border-gray-100 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Doctor Profile</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Medical Specialty</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact Intel</th>
                <th className="text-left py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">State</th>
                <th className="text-center py-5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 text-[#1e40af] dark:text-blue-400 rounded-xl flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">
                        {doctor.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#1e40af] transition-colors line-clamp-1">Dr. {doctor.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ROOM: {doctor.roomNumber || 'PENDING'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="badge badge-info !text-[10px] !px-2 !py-0.5">
                      {doctor.specialization || 'General'}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <FaEnvelope className="text-[#1e40af] opacity-40" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{doctor.email}</span>
                      </div>
                      {doctor.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <FaPhone className="text-[#1e40af] opacity-40" />
                          <span className="text-gray-600 dark:text-gray-300 font-medium">{doctor.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`badge !text-[10px] !px-2 !py-0.5 shadow-sm ${doctor.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {doctor.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleViewDoctor(doctor)} className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-[#1e40af] hover:text-white rounded-xl transition-all" title="View Dossier">
                        <FaEye size={14} />
                      </button>
                      <button onClick={() => handleEditDoctor(doctor)} className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-[#1e40af] hover:text-white rounded-xl transition-all" title="Modify Access">
                        <FaEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleStatusToggle(doctor._id, doctor.isActive ? 'active' : 'inactive')}
                        className={`p-2.5 rounded-xl transition-all ${doctor.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-600' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600'} hover:text-white`}
                        title={doctor.isActive ? 'Put on Leave' : 'Mark as Active'}
                      >
                        {doctor.isActive ? <FaTimes size={14} /> : <FaCheck size={14} />}
                      </button>
                      <button onClick={() => handleDelete(doctor._id)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all" title="Remove Record">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-24 bg-gray-50/30 dark:bg-white/2">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-600">
              <FaUserMd size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Medical Directory Empty</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-sm">No Doctors were found matching your current parameters.</p>
          </div>
        )}
      </div>

      {/* Doctor Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border-gray-100 dark:border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50 dark:border-white/5">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {showAddModal ? 'Onboard Doctor' : 'Modify Record'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-2 text-gray-400 hover:text-[#1e40af] transition-colors"><FaTimes /></button>
            </div>
            
            <form onSubmit={showAddModal ? handleAddDoctor : handleUpdateDoctor} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Doctor Name</label>
                  <input
                    type="text"
                    className="input"
                    value={showAddModal ? newDoctor.name : editDoctor.name}
                    onChange={(e) => showAddModal ? setNewDoctor({...newDoctor, name: e.target.value}) : setEditDoctor({...editDoctor, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Access Email</label>
                  <input
                    type="email"
                    className="input"
                    value={showAddModal ? newDoctor.email : editDoctor.email}
                    onChange={(e) => showAddModal ? setNewDoctor({...newDoctor, email: e.target.value}) : setEditDoctor({...editDoctor, email: e.target.value})}
                    required
                  />
                </div>
                {showAddModal && (
                  <div>
                    <label className="label">Secure Password</label>
                    <input
                      type="password"
                      className="input"
                      value={newDoctor.password}
                      onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                      required
                    />
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="label !mb-0">Medical Specialty</label>
                    <button 
                      type="button" 
                      onClick={() => navigate('/departments')}
                      className="text-[10px] font-black text-[#1e40af] dark:text-blue-400 hover:underline"
                    >
                      + Manage Departments
                    </button>
                  </div>
                  <select
                    className="input"
                    value={showAddModal ? newDoctor.specialization : editDoctor.specialization}
                    onChange={(e) => showAddModal ? setNewDoctor({...newDoctor, specialization: e.target.value}) : setEditDoctor({...editDoctor, specialization: e.target.value})}
                    required
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (<option key={spec} value={spec}>{spec}</option>))}
                  </select>
                </div>
                <div>
                  <label className="label">Contact Number</label>
                  <input
                    type="tel"
                    className="input"
                    value={showAddModal ? newDoctor.phone : editDoctor.phone}
                    onChange={(e) => showAddModal ? setNewDoctor({...newDoctor, phone: e.target.value}) : setEditDoctor({...editDoctor, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              {!showAddModal && (
                <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <label className="label !mb-0">Clinical Availability</label>
                    <button type="button" onClick={addAvailableTimeSlot} className="text-xs font-black text-[#1e40af] dark:text-blue-400 hover:underline">Add Slot</button>
                  </div>
                  <div className="space-y-2">
                    {editDoctor.availableTime.map((slot, index) => (
                      <div key={index} className="flex gap-2 items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                        <select className="input !py-1.5 text-xs" value={slot.day} onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}>
                          {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input type="time" className="input !py-1.5 text-xs" value={slot.startTime} onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)} />
                        <input type="time" className="input !py-1.5 text-xs" value={slot.endTime} onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)} />
                        <button type="button" onClick={() => removeAvailableTimeSlot(index)} className="p-2 text-red-400 hover:text-red-600"><FaTrash size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="btn btn-secondary flex-1">Abort</button>
                <button type="submit" className="btn btn-primary flex-1">Confirm Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border-gray-100 dark:border-white/10 shadow-2xl !p-0">
            <div className="h-32 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] relative">
               <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"><FaTimes /></button>
            </div>
            <div className="px-8 pb-8 -mt-12">
              <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
                <div className="w-32 h-32 bg-white dark:bg-[#0f172a] p-2 rounded-3xl shadow-xl border-4 border-white dark:border-[#0f172a]">
                  <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-[#1e40af] dark:text-blue-400 text-4xl font-black">
                    {selectedDoctor.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 pb-2">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dr. {selectedDoctor.name}</h2>
                  <p className="text-[#1e40af] dark:text-blue-400 font-bold uppercase text-xs tracking-widest mt-1">{selectedDoctor.specialization || 'Clinical Staff'}</p>
                </div>
                <div className="flex gap-2 pb-2">
                  <button onClick={() => { setShowViewModal(false); handleEditDoctor(selectedDoctor); }} className="btn btn-secondary !py-2 !text-xs">Edit Doctor</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">Doctor Intel</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: 'System Access', value: selectedDoctor.email, icon: FaEnvelope },
                      { label: 'Authorized Phone', value: selectedDoctor.phone || 'N/A', icon: FaPhone },
                      { label: 'Station ID', value: selectedDoctor.roomNumber || 'NOT ASSIGNED', icon: FaUserMd },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50/50 dark:bg-white/2 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                        <item.icon className="text-[#1e40af] opacity-40" />
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-2">Clinical Availability</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedDoctor.availableTime?.map((slot, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-white/2 rounded-xl border border-gray-100 dark:border-white/5">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{slot.day}</span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium text-xs bg-white dark:bg-white/5 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5 shadow-sm">
                          {slot.startTime} — {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;