import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-init';
import { doc, getDoc } from "firebase/firestore";

export default function Fees() {
    const navigate = useNavigate();
    const [feeData, setFeeData] = useState({ total: 0, paid: 0, pending: 0 });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const total = data.totalFee || 0;
                    const paid = data.paidFee || 0;
                    const pending = total - paid;
                    setFeeData({ total, paid, pending });
                }
            } else {
                navigate("/");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className="bg-gray-50 p-4 font-sans min-h-screen">
            <div className="max-w-md mx-auto relative h-full">
                <div className="flex justify-between items-center mb-6 pt-4">
                    <button onClick={() => navigate('/dashboard')} className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 transition">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Fee Details</h1>
                    <div className="w-10"></div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Fee Summary</h2>

                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 text-8xl transform translate-x-4 -translate-y-4">
                                <i className="fas fa-wallet"></i>
                            </div>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">Pending Fees</p>
                            <h1 className="text-4xl font-black mt-2 tracking-tight">₹ {feeData.pending}</h1>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Fees</p>
                                <h3 className="text-xl font-black text-gray-800">₹ {feeData.total}</h3>
                            </div>
                            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">Paid Amount</p>
                                <h3 className="text-xl font-black text-green-700">₹ {feeData.paid}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
