import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-init';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    sendPasswordResetEmail 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Login() {
    const navigate = useNavigate();
    
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [schoolCode, setSchoolCode] = useState('');
    
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && !isProcessing) {
                // If user is already logged in, redirect them
                checkRoleAndRedirect(user);
            }
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showError = (msg) => {
        let cleanMsg = msg.replace("Firebase: ", "");
        if (cleanMsg.includes("auth/user-not-found")) cleanMsg = "This email is not registered. Please Sign Up.";
        if (cleanMsg.includes("auth/wrong-password") || cleanMsg.includes("auth/invalid-credential")) cleanMsg = "Incorrect credentials. Please try again.";
        if (cleanMsg.includes("auth/invalid-email")) cleanMsg = "Invalid email format.";
        
        setErrorMsg(cleanMsg);
        setIsProcessing(false);
    };

    const checkRoleAndRedirect = async (user) => {
        try {
            const docRef = doc(db, "users", user.uid);
            let docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                let assignedRole = "student";
                let assignedSchoolId = schoolCode.toUpperCase();

                const adminRef = doc(db, "pre_registered_admins", user.email.toLowerCase());
                const adminSnap = await getDoc(adminRef);

                if (adminSnap.exists()) {
                    assignedRole = "admin";
                    assignedSchoolId = adminSnap.data().schoolId;
                }

                if (assignedRole === "student" && !assignedSchoolId) {
                    let manualCode = prompt("Please enter your School Code to continue:");
                    if (!manualCode) {
                        setIsProcessing(false);
                        throw new Error("School Code is compulsory for Students!");
                    }
                    assignedSchoolId = manualCode.toUpperCase();
                }

                await setDoc(docRef, {
                    name: user.displayName || "User",
                    email: user.email.toLowerCase(),
                    role: assignedRole,
                    schoolId: assignedSchoolId,
                    createdAt: serverTimestamp()
                });
                
                docSnap = await getDoc(docRef); 
            }

            const userData = docSnap.data();
            const userRole = (userData.role || "student").toLowerCase().trim();
            
            if (userRole === "admin") {
                navigate("/admin");
            } 
            else if (userRole === "teacher" || userRole === "staff") {
                navigate("/teacher-dashboard");
            } 
            else {
                navigate("/dashboard");
            }

        } catch (err) {
            showError(err.message);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            let userCredential;
            if (isLoginMode) {
                userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
                await checkRoleAndRedirect(userCredential.user);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
                await checkRoleAndRedirect(userCredential.user);
            }
        } catch (error) {
            showError(error.message);
        }
    };

    const handleForgotPassword = async () => {
        const cleanEmail = email.toLowerCase().trim();
        setErrorMsg('');
        setSuccessMsg('');

        if (!cleanEmail) {
            showError("Please enter your Email address first, then click 'Forgot Password'.");
            return;
        }

        setIsProcessing(true);

        try {
            const actionCodeSettings = {
                url: 'https://astracampus.vercel.app/auth/action.html',
                handleCodeInApp: false
            };
            
            await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
            
            setSuccessMsg("✅ Password reset link sent! Please check your email.");
            setIsProcessing(false);
        } catch (error) {
            showError(error.message);
        }
    };

    const handleGoogleAuth = async () => {
        setIsProcessing(true);
        setErrorMsg('');
        setSuccessMsg('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await checkRoleAndRedirect(result.user);
        } catch (error) {
            showError(error.message);
        }
    };

    return (
        <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-md">
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isLoginMode ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoginMode ? "Please enter your details to sign in" : "Sign up to access the portal"}
                    </p>
                </div>
                
                <form onSubmit={handleAuth} className="space-y-4">
                    
                    {!isLoginMode && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">School Code <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                required={!isLoginMode}
                                value={schoolCode}
                                onChange={(e) => setSchoolCode(e.target.value)}
                                placeholder="e.g. DAV01" 
                                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition uppercase" 
                                style={{textTransform: 'uppercase'}} 
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@school.com" 
                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition" 
                        />
                        
                        {isLoginMode && (
                            <div className="text-right mt-2">
                                <button 
                                    type="button" 
                                    onClick={handleForgotPassword}
                                    disabled={isProcessing}
                                    className="text-[11px] font-bold text-blue-600 hover:underline disabled:opacity-50"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </div>

                    {successMsg && <p className="text-green-600 text-sm font-bold text-center bg-green-50 p-2 rounded-lg border border-green-100">{successMsg}</p>}
                    {errorMsg && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">{errorMsg}</p>}

                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-md transition disabled:opacity-50"
                    >
                        {isProcessing ? "Processing..." : (isLoginMode ? "Sign In" : "Sign Up")}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button 
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setErrorMsg('');
                            setSuccessMsg('');
                        }} 
                        type="button"
                        className="text-sm font-bold text-blue-600 hover:underline"
                    >
                        {isLoginMode ? "Don't have an account? Create one" : "Already have an account? Sign In"}
                    </button>
                </div>

                <div className="relative flex items-center justify-center w-full mt-6 mb-6">
                    <div className="absolute w-full border-t border-gray-200"></div>
                    <span className="bg-white px-3 text-xs text-gray-400 font-bold uppercase relative z-10">OR</span>
                </div>

                <button 
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isProcessing}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 shadow-sm transition flex justify-center items-center gap-3 disabled:opacity-50"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
