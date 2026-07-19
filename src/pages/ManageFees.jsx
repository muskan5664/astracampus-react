import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-init';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

export default function ManageFees() {
    const navigate = useNavigate();
    const [adminSchoolId, setAdminSchoolId] = useState(null);
    const [selectedClass, setSelectedClass] = useState("");
    const [students, setStudents] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const [modalData, setModalData] = useState(null);
    const [modalTotalFee, setModalTotalFee] = useState("");
    const [modalPaidFee, setModalPaidFee] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const adminDoc = await getDoc(doc(db, 'users', user.uid));
                if (adminDoc.exists()) {
                    setAdminSchoolId(adminDoc.data().schoolId);
                }
            } else {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchFeeRecords = () => {
        if (!selectedClass) return alert("Please select a class!");
        if (!adminSchoolId) return alert("School ID missing. Please refresh.");

        setIsLoaded(true);
        setLoading(true);

        const q = query(
            collection(db, "users"), 
            where("class", "==", selectedClass),
            where("role", "==", "student"),
            where("schoolId", "==", adminSchoolId)
        );
        
        onSnapshot(q, (snapshot) => {
            let loaded = [];
            snapshot.forEach((docSnap) => {
                loaded.push({ id: docSnap.id, ...docSnap.data() });
            });
            setStudents(loaded);
            setLoading(false);
        });
    };

    const openModal = (student) => {
        setModalData(student);
        setModalTotalFee(student.totalFee === 0 ? "" : student.totalFee || "");
        setModalPaidFee(student.paidFee === 0 ? "" : student.paidFee || "");
    };

    const updateFee = async () => {
        const total = Number(modalTotalFee) || 0;
        const paid = Number(modalPaidFee) || 0;

        if (paid > total) return alert("Paid amount cannot be greater than Total Fee!");

        setIsSaving(true);
        try {
            await updateDoc(doc(db, "users", modalData.id), { totalFee: total, paidFee: paid });
            setModalData(null);
        } catch (error) {
            alert("Error updating fee: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 font-sans pb-24 min-h-screen relative">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-4">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-teal-600 transition">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Manage Fees</h1>
                    <div></div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-t-4 border-teal-500">
                    <label className="block text-sm font-bold text-gray-700 mb-2"><i className="fas fa-search text-teal-500 mr-2"></i>Select Class to View Students</label>
                    <div className="flex gap-2">
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-gray-50 focus:ring-2 focus:ring-teal-500 text-sm font-bold text-gray-600">
                            <option value="">Choose Class...</option>
                            {[...Array(12).keys()].map(i => <option key={i+1} value={String(i+1)}>Class {i+1}</option>)}
                        </select>
                        <button onClick={fetchFeeRecords} className="bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 shadow-md transition font-bold">
                            Load
                        </button>
                    </div>
                </div>

                {isLoaded && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-sm font-bold text-gray-800 uppercase">Fee Records</h2>
                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{students.length} Students</span>
                        </div>
                        
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-center text-sm text-gray-400 py-4"><i className="fas fa-spinner fa-spin mr-2"></i> Loading data...</p>
                            ) : students.length === 0 ? (
                                <p className="text-center text-sm text-red-400 py-4">No students found.</p>
                            ) : (
                                students.map(student => {
                                    const name = student.name || student.firstName || "Unknown";
                                    const totalFee = student.totalFee || 0;
                                    const paidFee = student.paidFee || 0;
                                    const pendingFee = totalFee - paidFee;
                                    const statusColor = pendingFee <= 0 ? "text-green-500" : "text-red-500";
                                    const bgStatus = pendingFee <= 0 ? "bg-green-50" : "bg-red-50";

                                    return (
                                        <div key={student.id} className="p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-3 border-b pb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-sm">{name}</h4>
                                                    <p className="text-[10px] text-gray-400">ID: {student.studentId || "N/A"}</p>
                                                </div>
                                                <button onClick={() => openModal(student)} className="text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition border border-teal-100">
                                                    <i className="fas fa-edit mr-1"></i> Edit Fee
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Total</p>
                                                    <p className="text-xs font-bold text-gray-700">₹{totalFee}</p>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Paid</p>
                                                    <p className="text-xs font-bold text-green-600">₹{paidFee}</p>
                                                </div>
                                                <div className={`${bgStatus} p-2 rounded-xl border border-gray-100`}>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Pending</p>
                                                    <p className={`text-xs font-bold ${statusColor}`}>₹{pendingFee}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {modalData && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                        <button onClick={() => setModalData(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        
                        <div className="w-16 h-16 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto shadow-inner">
                            <i className="fas fa-wallet"></i>
                        </div>
                        <h2 className="text-xl font-bold text-center text-gray-800 mb-1">{modalData.name || modalData.firstName || "Unknown"}</h2>
                        <p className="text-xs text-center text-gray-500 font-bold mb-6">ID: {modalData.studentId || "N/A"}</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Course Fee (₹)</label>
                                <input type="number" value={modalTotalFee} onChange={e => setModalTotalFee(e.target.value)} placeholder="e.g., 20000" className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-gray-50 focus:ring-2 focus:ring-teal-500 font-bold text-gray-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fee Paid So Far (₹)</label>
                                <input type="number" value={modalPaidFee} onChange={e => setModalPaidFee(e.target.value)} placeholder="e.g., 5000" className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-gray-50 focus:ring-2 focus:ring-teal-500 font-bold text-gray-800" />
                            </div>
                        </div>

                        <button onClick={updateFee} disabled={isSaving} className="w-full bg-teal-500 text-white font-bold py-3.5 rounded-xl hover:bg-teal-600 shadow-md transition flex justify-center items-center">
                            {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : "Save Fee Record"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
