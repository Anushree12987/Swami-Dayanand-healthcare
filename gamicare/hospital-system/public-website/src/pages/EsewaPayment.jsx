import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaShieldAlt, FaLock, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaEdit, FaSync } from 'react-icons/fa';

const EsewaPayment = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('Gamicare Health');

    useEffect(() => {
        fetchPaymentDetails();
    }, [appointmentId]);

    const fetchPaymentDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5001/api/payments/initiate-esewa',
                { appointmentId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // In Mock mode, we don't need paymentData or signatures
            setAmount(response.data.amount);
            setMerchant(response.data.merchant);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to initiate payment');
            navigate('/patient/appointments');
        }
    };

    const handleMockPayment = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const refId = `MOCK-ESW-${Math.random().toString(36).substring(7).toUpperCase()}`;
            
            // Wait for 2 seconds to simulate processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await axios.post(
                'http://localhost:5001/api/payments/verify-esewa',
                { 
                    oid: appointmentId, 
                    amt: parseFloat(amount),
                    refId: refId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Redirect to success page with mock parameters
                navigate(`/patient/payment-success?oid=${appointmentId}&amt=${amount}&refId=${refId}`);
            }
        } catch (error) {
            toast.error('Failed to process mock payment');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d2c4a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16C79A]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center py-10 px-4 font-sans">
            {/* Mock eSewa Navbar */}
            <div className="w-full max-w-lg bg-[#60bb46] p-4 rounded-t-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded-lg">
                        <span className="text-[#60bb46] font-black text-xl italic">e</span>
                    </div>
                    <span className="text-white font-bold text-xl uppercase tracking-tighter">Sewa Demo</span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-[10px] font-bold uppercase">Mock Portal</span>
                </div>
            </div>

            {/* Main Checkout Card */}
            <div className="w-full max-w-lg bg-white rounded-b-2xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    {/* Merchant Header */}
                    <div className="text-center mb-8 pb-6 border-b border-gray-100">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Paying to</p>
                        <h2 className="text-2xl font-black text-[#0d2c4a]">{merchant}</h2>
                        <p className="text-[#60bb46] text-xs font-bold mt-1 flex items-center justify-center gap-1">
                            <FaCheckCircle className="text-[10px]" /> Verified Merchant
                        </p>
                    </div>

                    <div className="flex justify-between items-center mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex-1">
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-extrabold mb-1 flex items-center gap-2">
                                <FaEdit className="text-[#60bb46]" /> Amount to Pay (Rs.)
                            </p>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-4xl font-black text-gray-800 bg-transparent border-none focus:outline-none w-full"
                                disabled={processing}
                            />
                        </div>
                        <div className="text-right border-l border-gray-200 pl-6">
                            <p className="text-gray-400 text-[10px] uppercase font-extrabold">Bill ID</p>
                            <p className="text-gray-600 font-mono text-sm font-bold">#{appointmentId.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-10">
                        <div className="flex items-start gap-4 p-4 bg-[#60bb46]/5 rounded-xl border border-[#60bb46]/10">
                            <FaShieldAlt className="text-[#60bb46] text-xl mt-0.5" />
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Gamicare Local Payment</p>
                                <p className="text-gray-500 text-xs leading-relaxed">
                                    You are in the project demonstration mode. This simulates the eSewa experience for your final year project presentation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {processing ? (
                        <div className="text-center py-10 bg-[#60bb46]/5 rounded-2xl animate-pulse">
                            <div className="mb-4">
                                <FaSync className="text-4xl text-[#60bb46] mx-auto animate-spin" />
                            </div>
                            <p className="text-gray-800 font-black tracking-wide">PROCESSING DEMO PAYMENT...</p>
                            <p className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-tighter">Communicating with Gamicare Server</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button 
                                onClick={handleMockPayment}
                                className="w-full py-5 bg-[#60bb46] hover:bg-[#52a03c] text-white font-black rounded-2xl transition-all shadow-xl shadow-[#60bb46]/30 flex items-center justify-center gap-3 active:scale-[0.98] text-lg"
                            >
                                <FaLock className="text-sm opacity-50" />
                                CONFIRM & PAY NOW
                            </button>
                            <button 
                                onClick={() => navigate('/patient/appointments')}
                                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm"
                            >
                                <FaTimesCircle className="opacity-50" />
                                ABORT TRANSACTION
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-4 opacity-40">
                        <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="h-4 grayscale" />
                        <div className="h-3 w-[1px] bg-gray-400"></div>
                        <p className="text-[9px] font-black tracking-[0.2em] uppercase italic text-gray-600">Secure Demo Environment</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => navigate('/patient/appointments')}
                className="mt-10 text-gray-400 hover:text-[#0d2c4a] font-bold flex items-center gap-2 transition-colors text-xs uppercase tracking-widest"
            >
                <FaArrowLeft />
                Return to Gamicare Dashboard
            </button>
        </div>
    );
};

export default EsewaPayment;
