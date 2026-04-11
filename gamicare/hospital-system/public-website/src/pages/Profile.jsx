import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaLock, FaCalendarAlt, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth(); // Assuming login or a similar update function can refresh the user
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    medicalInfo: {
      bloodType: '',
      allergies: '',
      chronicConditions: '',
      currentMedications: ''
    }
  });
  const [changePassword, setChangePassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        medicalInfo: {
          bloodType: user.medicalInfo?.bloodType || 'Not provided',
          allergies: user.medicalInfo?.allergies || 'None known',
          chronicConditions: user.medicalInfo?.chronicConditions || 'None',
          currentMedications: user.medicalInfo?.currentMedications || 'None'
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put('http://localhost:5001/api/users/profile', formData, config);
      toast.success('Profile updated successfully');
      
      setEditing(false);
      // Short delay before reload so user can see the toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post('http://localhost:5001/api/users/upload-photo', formData, config);
      toast.success('Photo updated successfully');
      
      // Short delay before reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (changePassword.newPassword !== changePassword.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put('http://localhost:5001/api/users/change-password', {
        currentPassword: changePassword.currentPassword,
        newPassword: changePassword.newPassword
      }, config);

      toast.success('Password changed successfully');
      setChangePassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-[#0d2c4a] to-[#19456B] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-[#16C79A]/80 mt-2">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20">
            <div className="p-6 border-b border-[#16C79A]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#16C79A]/20 to-[#16C79A]/10 rounded-xl border border-[#16C79A]/20">
                    <FaUser className="text-xl text-[#16C79A]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                </div>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
                    editing
                      ? 'bg-gradient-to-r from-[#16C79A] to-[#11698E] text-white hover:shadow-lg'
                      : 'bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 text-[#16C79A] hover:bg-gradient-to-r hover:from-[#16C79A]/20 hover:to-[#11698E]/20 border border-[#16C79A]/20'
                  }`}
                  disabled={loading}
                >
                  {editing ? (
                    <>
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <FaSave />
                      )}
                      Save Changes
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#16C79A]/80 mb-2">
                    <FaUser className="text-[#16C79A]" />
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white placeholder:text-[#16C79A]/60 focus:outline-none focus:ring-2 focus:ring-[#16C79A] focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] border border-[#16C79A]/20 rounded-xl text-white">
                      {user?.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#16C79A]/80 mb-2">
                    <FaEnvelope className="text-[#16C79A]" />
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white placeholder:text-[#16C79A]/60 focus:outline-none focus:ring-2 focus:ring-[#16C79A] focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] border border-[#16C79A]/20 rounded-xl text-white">
                      {user?.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#16C79A]/80 mb-2">
                    <FaPhone className="text-[#16C79A]" />
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white placeholder:text-[#16C79A]/60 focus:outline-none focus:ring-2 focus:ring-[#16C79A] focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+252 61 123 4567"
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] border border-[#16C79A]/20 rounded-xl text-white">
                      {user?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#16C79A]/80 mb-2">
                    <FaMapMarkerAlt className="text-[#16C79A]" />
                    Address
                  </label>
                  {editing ? (
                    <textarea
                      className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white placeholder:text-[#16C79A]/60 focus:outline-none focus:ring-2 focus:ring-[#16C79A] focus:border-transparent min-h-[100px] resize-none"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Your address..."
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] border border-[#16C79A]/20 rounded-xl text-white">
                      {user?.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              {/* Patient ID */}
              <div className="mt-8 pt-8 border-t border-[#16C79A]/20">
                <label className="text-sm font-medium text-[#16C79A]/80 mb-3 block">Patient ID</label>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="p-4 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] rounded-xl border border-[#16C79A]/20">
                    <span className="font-mono font-bold text-white text-lg tracking-wider">
                      {user?._id?.slice(-8) || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-[#16C79A]/80">
                    Use this ID for all hospital-related communications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 mt-8">
            <div className="p-6 border-b border-[#16C79A]/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#11698E]/20 to-[#11698E]/10 rounded-xl border border-[#16C79A]/20">
                  <FaShieldAlt className="text-xl text-[#11698E]" />
                </div>
                <h2 className="text-xl font-semibold text-white">Medical Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-[#16C79A]/80 mb-2">Blood Type</label>
                  {editing ? (
                    <select
                      className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#16C79A]"
                      value={formData.medicalInfo.bloodType}
                      onChange={(e) => setFormData({...formData, medicalInfo: {...formData.medicalInfo, bloodType: e.target.value}})}
                    >
                      <option value="Not provided">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] border border-[#16C79A]/20 rounded-xl text-white">
                      {formData.medicalInfo.bloodType}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#16C79A]/80 mb-2">Allergies</label>
                  {editing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#16C79A]"
                      value={formData.medicalInfo.allergies}
                      onChange={(e) => setFormData({...formData, medicalInfo: {...formData.medicalInfo, allergies: e.target.value}})}
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] border border-[#16C79A]/20 rounded-xl text-white">
                      {formData.medicalInfo.allergies}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#16C79A]/80 mb-2">Chronic Conditions</label>
                  {editing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#16C79A]"
                      value={formData.medicalInfo.chronicConditions}
                      onChange={(e) => setFormData({...formData, medicalInfo: {...formData.medicalInfo, chronicConditions: e.target.value}})}
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] border border-[#16C79A]/20 rounded-xl text-white">
                      {formData.medicalInfo.chronicConditions}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#16C79A]/80 mb-2">Current Medications</label>
                  {editing ? (
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#16C79A]"
                      value={formData.medicalInfo.currentMedications}
                      onChange={(e) => setFormData({...formData, medicalInfo: {...formData.medicalInfo, currentMedications: e.target.value}})}
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-r from-[#0d2c4a] to-[#19456B] border border-[#16C79A]/20 rounded-xl text-white">
                      {formData.medicalInfo.currentMedications}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#16C79A] to-[#11698E] rounded-full blur-sm opacity-30"></div>
                {user?.profilePicture ? (
                  <img 
                    src={`http://localhost:5001${user.profilePicture}`} 
                    alt="Profile" 
                    className="relative w-32 h-32 rounded-full border-4 border-[#19456B] object-cover"
                  />
                ) : (
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-[#16C79A] to-[#11698E] flex items-center justify-center text-white font-bold text-4xl border-4 border-[#19456B]">
                    {user?.name?.charAt(0) || 'P'}
                  </div>
                )}
                {loading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
              <p className="text-[#16C79A]">Patient</p>
              <div className="mt-4 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 text-[#16C79A] font-medium rounded-xl hover:bg-gradient-to-r hover:from-[#16C79A]/20 hover:to-[#11698E]/20 transition-all duration-300 border border-[#16C79A]/20"
                >
                  Change Photo
                </button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#16C79A]/20 to-[#16C79A]/10 rounded-xl border border-[#16C79A]/20">
                <FaLock className="text-xl text-[#16C79A]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Change Password</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#16C79A]/80 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white placeholder:text-[#16C79A]/60 focus:outline-none focus:ring-2 focus:ring-[#16C79A] focus:border-transparent"
                  value={changePassword.currentPassword}
                  onChange={(e) => setChangePassword({...changePassword, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#16C79A]/80 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white placeholder:text-[#16C79A]/60 focus:outline-none focus:ring-2 focus:ring-[#16C79A] focus:border-transparent"
                  value={changePassword.newPassword}
                  onChange={(e) => setChangePassword({...changePassword, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#16C79A]/80 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-[#0d2c4a] border border-[#16C79A]/20 rounded-xl text-white placeholder:text-[#16C79A]/60 focus:outline-none focus:ring-2 focus:ring-[#16C79A] focus:border-transparent"
                  value={changePassword.confirmPassword}
                  onChange={(e) => setChangePassword({...changePassword, confirmPassword: e.target.value})}
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={loading || !changePassword.currentPassword || !changePassword.newPassword}
                className={`w-full py-3 text-white font-bold rounded-xl transition-all duration-300 ${
                  loading || !changePassword.currentPassword || !changePassword.newPassword
                    ? 'bg-gradient-to-r from-[#0d2c4a] to-[#19456B] text-white/30 cursor-not-allowed border border-[#16C79A]/10'
                    : 'bg-gradient-to-r from-[#16C79A] to-[#11698E] hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#11698E]/20 to-[#11698E]/10 rounded-xl border border-[#16C79A]/20">
                <FaCheckCircle className="text-xl text-[#11698E]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Account Status</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#16C79A]/80">Account Created:</span>
                <span className="font-medium text-white">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#16C79A]/80">Status:</span>
                <span className={`px-3 py-1 bg-gradient-to-r ${user?.isActive ? 'from-[#16C79A]/20 to-[#16C79A]/10 text-[#16C79A]' : 'from-red-500/20 to-red-500/10 text-red-400'} text-xs font-medium rounded-full border border-[#16C79A]/20`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#16C79A]/80">Last Updated:</span>
                <span className="font-medium text-white">{formatDate(user?.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Medical Records Summary */}
          <div className="bg-gradient-to-br from-[#19456B] to-[#0d2c4a] rounded-2xl shadow-xl border border-[#16C79A]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl border border-emerald-500/20">
                <FaCalendarAlt className="text-xl text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Medical Records</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#16C79A]/80">Total Appointments:</span>
                <span className="font-bold text-white">{user?.totalAppointments || 0}</span>
              </div>
              <div className="pt-3 border-t border-[#16C79A]/20">
                <button
                    onClick={() => navigate('/patient/appointments')} 
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#16C79A]/10 to-[#11698E]/10 text-[#16C79A] font-medium rounded-xl hover:bg-gradient-to-r hover:from-[#16C79A]/20 hover:to-[#11698E]/20 transition-all duration-300 border border-[#16C79A]/20"
                >
                  View Medical History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;