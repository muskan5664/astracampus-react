import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase-init';
import { doc, setDoc } from 'firebase/firestore';

export default function ManageInstitutes() {
    const navigate = useNavigate();
    const [instName, setInstName] = useState("");
    const [instCode, setInstCode] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!instName || !instCode) return alert("Please fill all fields.");
        setIsSaving(true);
        try {
            await setDoc(doc(db, "settings", "institute"), { name: instName, code: instCode });
            alert("Institute Details Updated!");
            navigate(-1);
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 min-h-screen">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6 mt-10">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-indigo-600 transition">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Institute Details</h2>
                    <div></div>
                </div>
                
                <div className="space-y-4">
                    <input type="text" value={instName} onChange={e => setInstName(e.target.value)} placeholder="Institute Name" className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500" />
                    <input type="text" value={instCode} onChange={e => setInstCode(e.target.value)} placeholder="Institute Code" className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500" />
                    
                    <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                        {isSaving ? "Updating..." : "Update Details"}
                    </button>
                </div>
            </div>
        </div>
    );
}
