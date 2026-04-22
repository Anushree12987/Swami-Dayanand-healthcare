import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaHospital, 
  FaTimes, FaCheck, FaExclamationTriangle, FaStethoscope 
} from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const [newDept, setNewDept] = useState({
    name: '',
    description: '',
    icon: 'FaHospital'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/departments');
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      setProcessingId('add');
      await api.post('/admin/departments', newDept);
      toast.success('Department created successfully');
      setShowAddModal(false);
      setNewDept({ name: '', description: '', icon: 'FaHospital' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add department');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    try {
      setProcessingId(selectedDept._id);
      await api.put(`/admin/departments/${selectedDept._id}`, editForm);
      toast.success('Department updated successfully');
      setShowEditModal(false);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update department');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setProcessingId(id);
      await api.patch(`/admin/departments/${id}/toggle-status`);
      toast.success('Status updated');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This cannot be undone if no doctors are assigned.')) return;
    try {
      setProcessingId(id);
      await api.delete(`/admin/departments/${id}`);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDepts = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 dark:border-white/5 border-t-[#1e40af] mb-4"></div>
        <p className="text-gray-400 font-medium animate-pulse">Syncing hospital structure...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Hospital <span className="text-[#1e40af] dark:text-blue-400">Departments</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage medical specialties and units</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FaPlus size={14} /> New Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="card mb-8">
        <div className="relative group">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e40af] transition-colors" />
          <input
            type="text"
            placeholder="Search by department name or unit description..."
            className="input pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <div key={dept._id} className="card group hover:scale-[1.02] transition-all duration-300 border-gray-100 dark:border-white/5 shadow-lg relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full transition-transform duration-500 group-hover:scale-150`}></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/10 text-[#1e40af] dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-blue-100 dark:border-blue-900/20">
                <FaStethoscope />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedDept(dept);
                    setEditForm({ name: dept.name, description: dept.description, isActive: dept.isActive });
                    setShowEditModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-[#1e40af] dark:hover:text-blue-400 transition-colors"
                >
                  <FaEdit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(dept._id)}
                  disabled={processingId === dept._id}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>

            <div className="relative z-10 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{dept.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 min-h-[40px]">
                {dept.description || 'No description provided for this clinical unit.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5 relative z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dept.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${dept.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {dept.isActive ? 'Operational' : 'Inactive'}
                </span>
              </div>
              <button 
                onClick={() => handleToggleStatus(dept._id)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${dept.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
              >
                {dept.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDepts.length === 0 && (
        <div className="text-center py-24">
          <FaHospital className="text-6xl text-gray-100 dark:text-white/5 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Departments Found</h3>
          <p className="text-gray-400">Try adjusting your search or add a new department.</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="card w-full max-w-lg animate-in zoom-in-95 duration-200 border-gray-100 dark:border-white/10 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Add Department</h3>
            <form onSubmit={handleAddDept} className="space-y-6">
              <div>
                <label className="label">Department Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newDept.name}
                  onChange={(e) => setNewDept({...newDept, name: e.target.value})}
                  placeholder="e.g. Cardiology"
                  required 
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea 
                  className="input min-h-[100px] py-3" 
                  value={newDept.description}
                  onChange={(e) => setNewDept({...newDept, description: e.target.value})}
                  placeholder="Describe the clinical focus..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={processingId === 'add'} className="btn btn-primary flex-1">
                  {processingId === 'add' ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="card w-full max-w-lg animate-in zoom-in-95 duration-200 border-gray-100 dark:border-white/10 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Edit Department</h3>
            <form onSubmit={handleUpdateDept} className="space-y-6">
              <div>
                <label className="label">Department Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea 
                  className="input min-h-[100px] py-3" 
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                  className="w-5 h-5 rounded-lg border-gray-300 text-[#1e40af] focus:ring-[#1e40af]"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 dark:text-gray-300">Department is Active</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={processingId === selectedDept._id} className="btn btn-primary flex-1">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
