import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserShield, FaLock, FaShieldAlt, FaEye, FaEyeSlash, FaSignInAlt, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    // Load remembered email
    const savedEmail = localStorage.getItem('rememberedAdminEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Access Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Secure Key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);

      // Save email if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedAdminEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedAdminEmail');
      }

      toast.success('System access authorized');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Authentication failed. Please check your credentials.';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white dark:from-[#1E3A8A] to-gray-50 dark:to-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF]">
              <FaShieldAlt className="h-8 w-8 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Swami Dayanand</h1>
              <p className="text-[#2563EB] font-medium uppercase tracking-wider">Administrator Portal</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Security Login</h2>
          <p className="text-[#2563EB]/80 mt-2">Sign in to access the secure hospital system</p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-white dark:from-[#1E3A8A] to-gray-50 dark:to-[#0F172A] border border-gray-200 dark:border-[#2563EB]/20 rounded-2xl shadow-2xl p-8 transition-all duration-500 hover:shadow-[#2563EB]/10">
          {errors.general && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <FaExclamationCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <p className="text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-[#2563EB]/80 mb-2">
                Access Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#2563EB] transition-colors">
                  <FaUserShield className="h-5 w-5 text-[#2563EB]/60" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-white dark:bg-[#1E40AF]/10 pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-300 text-black dark:text-white placeholder-[#2563EB]/30 ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-[#2563EB]/20'
                    }`}
                  placeholder="admin@gamicare.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#2563EB]/80 mb-2">
                Secure Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#2563EB] transition-colors">
                  <FaLock className="h-5 w-5 text-[#2563EB]/60" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full bg-white dark:bg-[#1E40AF]/10 pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-300 text-black dark:text-white placeholder-[#2563EB]/30 ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-[#2563EB]/20'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2563EB]/60 hover:text-[#2563EB] transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-[#2563EB]/80 cursor-pointer">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-[#2563EB] hover:text-[#1E40AF] font-medium transition-colors"
              >
                Forgot key?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white py-3 px-4 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verifying Access...
                </>
              ) : (
                <>
                  <FaSignInAlt className="h-5 w-5" />
                  Enter Control Panel
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/10">
            <p className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-3">Demo Console Access:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#2563EB]/70">Admin ID:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">admin@gamicare.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#2563EB]/70">Security Key:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">admin123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-10 text-center">
          <p className="text-[#2563EB]/70">
            System issue?{' '}
            <a
              href="mailto:support@swamidayanandhospital.com"
              className="text-[#2563EB] hover:text-[#1E40AF] font-bold underline transition-all"
            >
              Contact Support
            </a>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2563EB]/10">
            <p className="text-sm text-[#2563EB]/50">
              © {new Date().getFullYear()} Swami Dayanand Hospital. Enterprise Security Edition.
            </p>
            <p className="text-[10px] text-[#2563EB]/30 mt-2 uppercase tracking-[0.2em]">
              Authorized Access Only • 256-bit AES Encryption
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#2563EB]/40 italic">
          <FaShieldAlt className="h-4 w-4" />
          <span>Secured by GamiCare Infrastructure</span>
        </div>
      </div>
    </div>
  );
};

export default Login;