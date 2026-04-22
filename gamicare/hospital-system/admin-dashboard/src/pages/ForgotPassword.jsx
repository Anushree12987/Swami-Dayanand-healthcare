import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaKey, FaLock, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Security OTP sent to your admin email!');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                password: newPassword
            });
            toast.success('Security Key reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset security key. Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white dark:from-[#1E3A8A] to-gray-50 dark:to-[#0F172A] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF]">
                            <FaShieldAlt className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Swami Dayanand</h1>
                            <p className="text-[#2563EB] font-medium uppercase tracking-wider">Administrator Portal</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white dark:from-[#1E3A8A] to-gray-50 dark:to-[#0F172A] border border-gray-200 dark:border-[#2563EB]/20 rounded-2xl shadow-2xl p-8 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Security Key</h2>
                                    <p className="text-[#2563EB]/80 mt-2">Enter your email to receive a recovery OTP</p>
                                </div>

                                <form onSubmit={handleSendEmail} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#2563EB]/80 mb-2">
                                            Admin Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaEnvelope className="h-5 w-5 text-[#2563EB]" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1E40AF]/10 pl-10 pr-4 py-3 border border-gray-200 dark:border-[#2563EB]/20 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all text-black dark:text-white placeholder-[#2563EB]/30"
                                                placeholder="admin@gamicare.com"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white py-3.5 px-4 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Sending Recovery Code...' : 'Send Recovery OTP'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Recovery</h2>
                                    <p className="text-[#2563EB]/80 mt-2">We've sent a code to your security email</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#2563EB]/80 mb-2">
                                            6-Digit Security OTP
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaKey className="h-5 w-5 text-[#2563EB]" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1E40AF]/10 pl-10 pr-4 py-3 border border-gray-200 dark:border-[#2563EB]/20 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all text-black dark:text-white tracking-[0.5em] text-center"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#2563EB]/80 mb-2">
                                            New Security Key
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="h-5 w-5 text-[#2563EB]" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-[#1E40AF]/10 pl-10 pr-4 py-3 border border-gray-200 dark:border-[#2563EB]/20 rounded-xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all text-black dark:text-white placeholder-[#2563EB]/30"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white py-3.5 px-4 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Updating Security Key...' : 'Reset Security Key'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#2563EB]/10 text-center">
                        <Link to="/login" className="inline-flex items-center text-[#2563EB] hover:text-[#1E40AF] font-bold transition-all group">
                            <FaArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Admin Login
                        </Link>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="mt-8 text-center text-[10px] text-[#2563EB]/30 uppercase tracking-[0.2em]">
                    Swami Dayanand Hospital • Security Recovery Console v2.0
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
