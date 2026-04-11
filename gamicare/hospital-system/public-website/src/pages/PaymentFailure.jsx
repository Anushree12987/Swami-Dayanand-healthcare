import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft, FaUndo } from 'react-icons/fa';

const PaymentFailure = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const oid = searchParams.get('oid');

    return (
        <div className="min-h-screen bg-[#fef2f2] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
                <div className="bg-[#EF4444] p-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 animate-pulse">
                        <FaTimesCircle className="text-white text-5xl" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Payment Failed</h1>
                    <p className="text-white/80 font-medium mt-1 uppercase tracking-widest text-sm">Transaction Cancelled</p>
                </div>

                <div className="p-8">
                    <div className="text-center space-y-6">
                        <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center">
                            <p className="text-gray-700 font-medium mb-2">We couldn't process your payment.</p>
                            <p className="text-gray-500 text-sm italic">
                                This could be due to insufficient balance, network issues, or a manual cancellation on eSewa.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {oid && (
                                <button 
                                    onClick={() => navigate(`/patient/pay-esewa/${oid}`)}
                                    className="w-full py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <FaUndo className="text-xs" />
                                    RETRY PAYMENT
                                </button>
                            )}
                            
                            <button 
                                onClick={() => navigate('/patient/appointments')}
                                className="w-full py-4 bg-[#0d2c4a] hover:bg-[#1a4b7a] text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group active:scale-95"
                            >
                                <FaArrowLeft className="text-xs" />
                                BACK TO APPOINTMENTS
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

export default PaymentFailure;
