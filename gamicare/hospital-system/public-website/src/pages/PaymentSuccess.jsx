import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [appointment, setAppointment] = useState(null);

    const oid = searchParams.get('oid');
    const amt = searchParams.get('amt');
    const refId = searchParams.get('refId');
    const data = searchParams.get('data');

    useEffect(() => {
        if ((oid && amt && refId) || data) {
            handleVerification();
        } else {
            toast.error('Invalid payment parameters');
            navigate('/patient/appointments');
        }
    }, [oid, amt, refId, data]);

    const handleVerification = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5001/api/payments/verify-esewa',
                { oid, amt, refId, data },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setAppointment(response.data.appointment);
                toast.success('Payment Verified Successfully!');
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Failed to verify payment status');
        } finally {
            setVerifying(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-[#0d2c4a] flex flex-col items-center justify-center text-white p-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#16C79A] mb-6"></div>
                <h2 className="text-2xl font-bold">Verifying Payment...</h2>
                <p className="text-gray-400 mt-2 text-center">Please do not close this window while we confirm your transaction with eSewa.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
                <div className="bg-[#16C79A] p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg animate-bounce">
                        <FaCheckCircle className="text-[#16C79A] text-5xl" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Payment Successful!</h1>
                    <p className="text-white/80 font-medium mt-1">Transaction Ref: {refId}</p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-[#16C79A]/10 rounded-xl">
                                    <FaCalendarAlt className="text-[#16C79A] text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Appointment ID</p>
                                    <p className="font-bold text-gray-800">#{oid?.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Amount Paid</p>
                                <p className="font-black text-[#16C79A] text-xl">Rs. {amt}</p>
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-gray-600 text-sm italic">
                                Your appointment has been successfully confirmed. You can now view your digital prescription or join the consultation room at the scheduled time.
                            </p>
                            
                            <button 
                                onClick={() => navigate('/patient/appointments')}
                                className="w-full py-4 bg-[#0d2c4a] hover:bg-[#1a4b7a] text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group active:scale-95"
                            >
                                GO TO MY APPOINTMENTS
                                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-center gap-6">
                    <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="h-6 opacity-60 grayscale" />
                    <div className="h-4 w-[1px] bg-gray-300"></div>
                    <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase italic">Securely processed via eSewa</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
