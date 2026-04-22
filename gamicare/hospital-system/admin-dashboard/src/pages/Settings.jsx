import React, { useState } from 'react';
import { FaSave, FaCog, FaBell, FaShieldAlt, FaDatabase, FaUserShield, FaCalendarAlt, FaDollarSign, FaHospital, FaTrashAlt, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    hospitalName: 'Swami Dayanand Hospital',
    hospitalEmail: 'info@swamidayanandhospital.in',
    hospitalPhone: '+91 11 2258 8585',
    hospitalAddress: 'M8H3+978, Shahdara North Zone C-Block, Dilshad Garden New Delhi, Delhi 110095, India Adjacent Landmark: IHBAS cum GTBH',
    appointmentDuration: 30,
    workingHoursStart: '08:00',
    workingHoursEnd: '20:00',
    notifyOnNewAppointment: true,
    notifyOnCancellation: true,
    smsNotifications: true,
    emailNotifications: true,
    currency: 'INR',
    consultationFee: 50,
    followupFee: 30,
    emergencyFee: 100
  });

  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('General Settings');

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Clinical parameters updated successfully');
      setSaving(false);
    }, 1000);
  };

  const categories = [
    { icon: FaCog, label: 'General Settings' },
    { icon: FaBell, label: 'Notifications' },
    { icon: FaShieldAlt, label: 'Secured Access' },
    { icon: FaDatabase, label: 'Data Hub' },
    { icon: FaUserShield, label: 'Permissions' }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            System <span className="text-[#1e40af] dark:text-blue-400">Control</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Configure clinical protocols and regional hospital parameters</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary !py-2.5 !text-[10px] font-black uppercase tracking-widest">
            Export Config
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary flex items-center gap-2">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div> : <FaSave size={14} />}
            Commit Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card !p-2 space-y-1">
            {categories.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(item.label)}
                className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all group ${activeCategory === item.label ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1e40af] dark:text-blue-400 font-black' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 font-bold'}`}
              >
                <item.icon className={`${activeCategory === item.label ? 'scale-110' : 'opacity-40'} group-hover:scale-110 transition-transform`} />
                <span className="text-xs uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="card bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 p-6">
            <FaShieldAlt className="text-amber-600 mb-4 text-xl" />
            <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-2">Maintenance Mode</h4>
            <p className="text-[10px] font-medium text-amber-700/80 dark:text-amber-400/60 leading-relaxed mb-4">Restricting system access will prevent patients from booking new appointments during the lockout period.</p>
            <button className="w-full py-2 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-colors">Enter Lockout</button>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-3 space-y-8">
          {/* Hospital Identity */}
          <div className="card">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 dark:border-white/5">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-[#1e40af] dark:text-blue-400 rounded-lg"><FaHospital /></div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Clinical Identity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Registered Hospital Name</label>
                <input type="text" className="input" value={settings.hospitalName} onChange={(e) => setSettings({...settings, hospitalName: e.target.value})} />
              </div>
              <div>
                <label className="label">Primary Clinical Email</label>
                <input type="email" className="input" value={settings.hospitalEmail} onChange={(e) => setSettings({...settings, hospitalEmail: e.target.value})} />
              </div>
              <div>
                <label className="label">Authorized Contact Line</label>
                <input type="tel" className="input" value={settings.hospitalPhone} onChange={(e) => setSettings({...settings, hospitalPhone: e.target.value})} />
              </div>
              <div>
                <label className="label">Full Geospatial Address</label>
                <input type="text" className="input" value={settings.hospitalAddress} onChange={(e) => setSettings({...settings, hospitalAddress: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="card">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 dark:border-white/5">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><FaCalendarAlt /></div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Appointment Protocols</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Slot Duration (Min)</label>
                <select className="input cursor-pointer" value={settings.appointmentDuration} onChange={(e) => setSettings({...settings, appointmentDuration: parseInt(e.target.value)})}>
                  {[15, 30, 45, 60].map(m => (<option key={m} value={m} className="dark:bg-[#0f172a]">{m} Minutes</option>))}
                </select>
              </div>
              <div>
                <label className="label">OPD Start (HH:MM)</label>
                <input type="time" className="input" value={settings.workingHoursStart} onChange={(e) => setSettings({...settings, workingHoursStart: e.target.value})} />
              </div>
              <div>
                <label className="label">OPD End (HH:MM)</label>
                <input type="time" className="input" value={settings.workingHoursEnd} onChange={(e) => setSettings({...settings, workingHoursEnd: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Financial Parameters */}
          <div className="card">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 dark:border-white/5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><FaDollarSign /></div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Financial Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Regional Currency</label>
                <select className="input cursor-pointer" value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})}>
                   <option value="INR" className="dark:bg-[#0f172a]">INR (₹) — Indian Rupee</option>
                   <option value="NPR" className="dark:bg-[#0f172a]">NPR (₨) — Nepalese Rupee</option>
                   <option value="USD" className="dark:bg-[#0f172a]">USD ($) — US Dollar</option>
                </select>
              </div>
              <div>
                <label className="label">Base Consultation Fee</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">₹</span>
                  <input type="number" className="input pl-8" value={settings.consultationFee} onChange={(e) => setSettings({...settings, consultationFee: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="label">Base Follow-up Fee</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">₹</span>
                  <input type="number" className="input pl-8" value={settings.followupFee} onChange={(e) => setSettings({...settings, followupFee: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Synchronization */}
          <div className="card">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50 dark:border-white/5">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-[#1e40af] dark:text-blue-400 rounded-lg"><FaBell /></div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Alert Synchronization</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Booking Confirmation', desc: 'Trigger real-time alerts for new appointment entries', state: settings.notifyOnNewAppointment, key: 'notifyOnNewAppointment' },
                { label: 'Cancellation Alerts', desc: 'Immediate notification of appointment slot openings', state: settings.notifyOnCancellation, key: 'notifyOnCancellation' },
                { label: 'Patient SMS Dispatch', desc: 'Automated clinical reminders via encrypted SMS channels', state: settings.smsNotifications, key: 'smsNotifications' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/2 rounded-2xl border border-gray-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/5 transition-all">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">{item.label}</h4>
                    <p className="text-[10px] font-medium text-gray-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.state}
                      onChange={(e) => setSettings({...settings, [item.key]: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e40af]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 p-8 bg-gray-50/50 dark:bg-white/2 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
            <button className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2">
              <FaTrashAlt /> Factory Reset
            </button>
            <button onClick={handleSave} className="btn btn-primary px-12">Commit All Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;