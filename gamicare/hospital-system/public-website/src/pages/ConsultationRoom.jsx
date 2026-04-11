import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPhoneSlash, FaMicrophone, FaVideo, FaDesktop, FaChartLine, FaUserMd, FaClock, FaCalendarAlt, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const ConsultationRoom = () => {
  const { roomID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [roomStatus, setRoomStatus] = useState('loading'); // loading, authorized, too-early, expired, error
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    fetchAppointmentDetails();
    
    return () => {
      if (jitsiApi) jitsiApi.dispose();
    };
  }, [roomID]);

  const fetchAppointmentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/appointments/room/${roomID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const appData = response.data.data;
      setAppointment(appData);
      validateRoomAccess(appData);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      setRoomStatus('error');
      toast.error('Failed to validate consultation room');
    }
  };

  const validateRoomAccess = (app) => {
    const now = new Date();
    const appDate = new Date(app.date);
    
    // Parse time (e.g., "10:30 AM")
    const [time, modifier] = app.time.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
    if (modifier === 'AM' && hours === '12') hours = 0;
    
    appDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const diffMs = appDate - now;
    const diffMins = diffMs / (1000 * 60);

    if (diffMins > 15) {
      setRoomStatus('too-early');
      calculateTimeRemaining(appDate);
    } else if (diffMins < -60) { // Assume 1 hour session limit
      setRoomStatus('expired');
    } else {
      setRoomStatus('authorized');
      loadJitsiScript();
    }
  };

  const calculateTimeRemaining = (targetDate) => {
    const update = () => {
      const now = new Date();
      const diff = targetDate - now;
      
      if (diff <= 15 * 60 * 1000) {
        setRoomStatus('authorized');
        loadJitsiScript();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeStr = "";
      if (days > 0) timeStr += `${days}d `;
      if (hours > 0) timeStr += `${hours}h `;
      timeStr += `${mins}m`;
      
      setTimeRemaining(timeStr);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  };

  const loadJitsiScript = () => {
    if (window.JitsiMeetExternalAPI) {
      startConference();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => startConference();
    document.body.appendChild(script);
  };

  const startConference = () => {
    if (!window.JitsiMeetExternalAPI) {
      toast.error('Failed to load video conferencing tool');
      return;
    }

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomID,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: user?.name || 'Gamicare Patient'
      },
      configOverwrite: {
        startWithAudioMuted: true,
        disableDeepLinking: true,
        enableWelcomePage: false,
        prejoinPageEnabled: false
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    
    api.addEventListeners({
      videoConferenceJoined: () => {
        setIsJoined(true);
        toast.success('Connected to doctor');
      },
      videoConferenceLeft: () => {
        navigate('/patient/dashboard');
      }
    });

    setJitsiApi(api);
  };

  const handleLeave = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    } else {
      navigate('/patient/dashboard');
    }
  };

  if (roomStatus === 'loading') {
    return (
      <div className="h-screen bg-[#0d2c4a] flex items-center justify-center text-center">
        <div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#16C79A] mx-auto mb-4"></div>
          <p className="text-white font-medium">Validating consultation session...</p>
        </div>
      </div>
    );
  }

  if (roomStatus === 'too-early') {
    return (
      <div className="h-screen bg-[#0d2c4a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#19456B] rounded-3xl p-8 border border-[#16C79A]/20 shadow-2xl text-center">
          <div className="w-20 h-20 bg-[#16C79A]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#16C79A]/20">
            <FaClock className="text-4xl text-[#16C79A]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're a bit early!</h2>
          <p className="text-[#16C79A] mb-6">Your consultation with {appointment?.doctorId?.name} is scheduled for:</p>
          
          <div className="bg-[#0d2c4a] rounded-2xl p-4 mb-8 border border-[#16C79A]/10">
            <div className="flex items-center justify-center gap-4 text-white mb-2">
              <FaCalendarAlt className="text-[#16C79A]" />
              <span className="font-semibold">{new Date(appointment?.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-white">
              <FaClock className="text-[#16C79A]" />
              <span className="font-semibold">{appointment?.time}</span>
            </div>
          </div>
          
          <div className="text-sm text-white/60 mb-8 italic">
            Room opens 15 minutes before the scheduled time. <br/>
            Starts in: <span className="text-white font-bold not-italic">{timeRemaining}</span>
          </div>
          
          <button 
            onClick={() => navigate('/patient/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-[#16C79A] to-[#11698E] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (roomStatus === 'expired' || roomStatus === 'error') {
    return (
      <div className="h-screen bg-[#0d2c4a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#19456B] rounded-3xl p-8 border border-red-500/20 shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <FaExclamationTriangle className="text-4xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {roomStatus === 'expired' ? 'Session Expired' : 'Access Error'}
          </h2>
          <p className="text-white/60 mb-8">
            {roomStatus === 'expired' 
              ? 'This consultation session has ended or the link has expired.' 
              : 'We couldn\'t validate this consultation room. Please contact support.'}
          </p>
          <button 
            onClick={() => navigate('/patient/dashboard')}
            className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 text-white font-bold rounded-xl border border-red-500/30 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0d2c4a] flex flex-col overflow-hidden">
      {/* Consultation Header */}
      <div className="bg-[#19456B] border-b border-[#16C79A]/20 p-4 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#16C79A] to-[#11698E] rounded-xl flex items-center justify-center text-white text-xl border border-white/20">
            <FaUserMd />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Virtual Consultation Room</h1>
            <div className="flex items-center gap-2 text-[#16C79A] text-xs">
              <span className="w-2 h-2 bg-[#16C79A] rounded-full animate-pulse"></span>
              Secure & Encrypted Session
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Doctor</p>
            <p className="text-[#16C79A] font-bold text-sm">{appointment?.doctorId?.name}</p>
          </div>
          <button
            onClick={handleLeave}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <FaPhoneSlash />
            Leave Call
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Loading Overlay (only shown while Jitsi is loading but authorized) */}
        {!isJoined && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d2c4a] z-0">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#16C79A] mx-auto mb-4"></div>
                    <p className="text-white font-medium">Connecting to secure server...</p>
                    <p className="text-[#16C79A]/60 text-sm mt-1">Starting video conferencing tool</p>
                    <p className="text-white/40 text-[10px] mt-4">Please allow camera and microphone access when prompted</p>
                </div>
            </div>
        )}

        {/* Jitsi Container */}
        <div className="flex-1 relative z-10">
           <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
      </div>

      {/* Mobile Footer (Leave Button) */}
      <div className="md:hidden bg-[#19456B] p-4 text-center">
          <button
            onClick={handleLeave}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <FaPhoneSlash />
            End Consultation
          </button>
      </div>
    </div>
  );
};

export default ConsultationRoom;

