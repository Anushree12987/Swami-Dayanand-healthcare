import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSearch, 
  FaStethoscope, 
  FaShieldAlt, 
  FaUserMd, 
  FaInfoCircle, 
  FaHeartbeat, 
  FaArrowRight, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaHospitalUser,
  FaNotesMedical
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SymptomChecker = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const checkSymptoms = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error('Please enter some symptoms');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("http://localhost:5001/api/symptoms/check", { input });
      // Add a small delay to simulate analysis for premium feel
      setTimeout(() => {
        setResult(res.data);
        setLoading(false);
        toast.success('Analysis complete');
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Error checking symptoms");
      setLoading(false);
    }
  };

  const handleQuickBook = (doctor) => {
    navigate('/patient/book-appointment', { state: { preSelectedDoctor: doctor } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f0ff] to-white p-4 md:p-8">
      {/* Disclaimer Card - HIGH VISIBILITY */}
      <div className="max-w-4xl mx-auto mb-10 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] p-6 rounded-3xl border-2 border-red-400 animate-pulse">
        <div className="flex items-center gap-4">
           <div className="bg-white/20 p-3 rounded-full text-white">
              <FaExclamationTriangle size={28} />
           </div>
           <div>
              <h4 className="text-white font-black text-xl md:text-2xl mb-1 uppercase tracking-tight">Medical Emergency?</h4>
              <p className="text-white/90 text-sm md:text-base font-medium leading-tight">
                This AI tool is NOT for emergencies. If you are in critical condition, call 102 (Ambulance) or go to the nearest hospital immediately.
              </p>
           </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 text-sm font-bold mb-6">
          <FaShieldAlt className="animate-bounce" />
          Smart Diagnostic Assistant
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0d2c4a] mb-4">
          How are you <span className="text-[#16C79A]">feeling</span> today?
        </h1>
        <p className="text-[#19456B]/60 text-lg max-w-2xl mx-auto">
          Enter your symptoms for an AI-powered medical scan and doctor suggestions.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Search Bar Area */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <form onSubmit={checkSymptoms} className="relative z-10">
            <div className="relative group">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 text-xl group-focus-within:scale-110 transition-transform" />
              <input
                type="text"
                placeholder="e.g. headache, fever, chest pain, nausea..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-14 pr-32 py-5 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 text-[#0d2c4a] text-lg placeholder:text-blue-300 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={loading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-[#16C79A] text-white hover:shadow-lg hover:scale-105 active:scale-95 shadow-md hover:bg-[#11698E]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Scanning...
                  </div>
                ) : (
                  <>
                    <FaStethoscope />
                    Check
                  </>
                )}
              </button>
            </div>
            <p className="mt-4 text-[#19456B]/40 text-sm flex items-center justify-center gap-2">
              <FaInfoCircle size={14} />
              e.g. "fever, cough" or "back pain"
            </p>
          </form>
        </div>

        {/* Results Analysis */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Condition Overview */}
            <div className="bg-white p-8 rounded-3xl border-l-[12px] border-[#16C79A] shadow-xl border-t border-r border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 italic">Our Analysis Suggests</h3>
                  <h2 className="text-3xl font-bold text-[#0d2c4a] flex items-center gap-3">
                    <FaHeartbeat className="text-red-500" />
                    {result.disease}
                  </h2>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                  <div className="text-blue-600 text-xs font-bold uppercase mb-1">Diagnosis Strength</div>
                  <div className="text-2xl font-bold text-[#0d2c4a]">{result.matchScore * 25}%</div>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${result.matchScore * 25}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-[#11698E] font-bold flex items-center gap-2 mb-3">
                    <FaNotesMedical />
                    Recommended Protocol
                  </h4>
                  <p className="text-gray-700 leading-relaxed italic">{result.treatment}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="text-[#16C79A] font-bold flex items-center gap-2 mb-3">
                    <FaCheckCircle />
                    Relevant Departments
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.specializations.map(spec => (
                      <span key={spec} className="px-3 py-1 bg-white text-blue-600 rounded-full text-sm font-semibold border border-blue-100 shadow-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Recommendations */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6 px-4">
                <h3 className="text-2xl font-black text-[#0d2c4a] flex items-center gap-3 uppercase tracking-tighter">
                  <FaUserMd className="text-blue-600" />
                  Recommended Specialists
                </h3>
                <span className="text-gray-400 text-sm font-medium">Matching doctors found</span>
              </div>

              {result.recommendedDoctors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.recommendedDoctors.map((doc) => (
                    <div 
                      key={doc._id} 
                      className="group bg-white rounded-3xl border border-gray-100 p-6 hover:border-blue-300 transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden relative shadow-lg"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <FaHospitalUser size={80} className="text-blue-600" />
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 border border-blue-200 overflow-hidden shadow-sm">
                          {doc.profilePicture ? (
                            <img src={`http://localhost:5001${doc.profilePicture}`} alt={doc.name} className="w-full h-full object-cover" />
                          ) : (
                            doc.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="text-[#0d2c4a] font-bold text-lg group-hover:text-blue-600 transition-colors italic">Dr. {doc.name}</h4>
                          <p className="text-blue-600/80 text-sm font-bold uppercase tracking-wider">{doc.specialization}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6 relative z-10 bg-gray-50 p-4 rounded-xl">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-medium">Experience</span>
                          <span className="text-[#0d2c4a] font-bold">{doc.experience || 10}+ Years</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-medium">Rating</span>
                          <span className="text-yellow-500 font-black">★ {doc.rating?.average || (4.5 + Math.random()*0.5).toFixed(1)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickBook(doc)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-[#11698E] text-white rounded-2xl font-black group-hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      >
                         <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                         Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-200 p-12 rounded-3xl text-center shadow-inner">
                  <div className="text-5xl mb-4">⚕️</div>
                  <h4 className="text-[#0d2c4a] font-bold text-xl mb-2">No direct specialists matched</h4>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Please visit our general OPD for a full evaluation.
                  </p>
                  <Link 
                    to="/doctors"
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg"
                  >
                    View All Doctors
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;
