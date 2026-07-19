import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-init';
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Results() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user) {
                const q = query(collection(db, "results"), where("studentId", "==", user.uid));
                const unsub = onSnapshot(q, (snapshot) => {
                    const docs = [];
                    snapshot.forEach(d => docs.push({ id: d.id, ...d.data() }));
                    docs.sort((a,b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
                    setResults(docs);
                    setLoading(false);
                });
                return () => unsub();
            } else {
                navigate("/");
            }
        });
        return () => unsubscribeAuth();
    }, [navigate]);

    return (
        <div className="bg-gray-50 pb-20 font-sans min-h-screen">
            <div className="bg-amber-500 text-white p-4 rounded-b-3xl shadow-md sticky top-0 z-50">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate('/dashboard')} className="hover:bg-white/20 p-2 rounded-xl transition">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <h1 className="text-lg font-bold">My Results</h1>
                    <div className="w-8"></div>
                </div>
            </div>
            <div className="px-4 mt-6 space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <i className="fas fa-spinner fa-spin text-3xl text-amber-500 mb-2"></i>
                        <p className="text-sm text-gray-500">Loading results...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                        <p className="text-sm font-bold text-gray-500">No test results found.</p>
                    </div>
                ) : (
                    results.map(r => (
                        <div key={r.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm">{r.testTitle}</h3>
                                <p className="text-[10px] text-gray-500">{new Date(r.timestamp?.toMillis() || 0).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="font-black text-amber-600 text-xl">{r.score}/{r.totalQuestions}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
