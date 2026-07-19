cat << 'INNER_EOF' > src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-init";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  FaPowerOff,
  FaVideo,
  FaBookOpen,
  FaClipboardList,
  FaLaptopCode,
  FaTrophy,
  FaWallet,
  FaCalendarCheck,
  FaEllipsisH,
  FaCalendarAlt,
  FaImages,
  FaCommentDots,
  FaCommentAlt,
  FaBullhorn,
  FaRegClock,
  FaPlay,
  FaHome,
  FaUser,
  FaChalkboardTeacher,
  FaQuestionCircle,
  FaBell,
  FaEdit,
  FaGraduationCap
} from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [showAllIcons, setShowAllIcons] = useState(false);

  const [userData, setUserData] = useState({
    name: "Loading...",
    studentId: "---",
    batchName: "...",
    photoUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    targetClass: "",
  });

  const [liveClasses, setLiveClasses] = useState([]);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12
        ? "Good Morning"
        : hour < 18
        ? "Good Afternoon"
        : "Good Evening"
    );

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const schoolId = data.schoolId;
            const targetClassStr = String(data.class || "");

            setUserData({
              name: data.name || data.firstName || "Student",
              studentId: data.studentId || data.admissionNo || "N/A",
              batchName: `${data.class || "N/A"}${
                data.section ? ` ${data.section}` : ""
              }`,
              photoUrl:
                data.photoUrl ||
                data.photoBase64 ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              targetClass: targetClassStr,
            });

            if (schoolId && targetClassStr) {
              const liveQ = query(
                collection(db, "live_classes"),
                where("schoolId", "==", schoolId),
                where("targetClass", "==", targetClassStr)
              );
              onSnapshot(liveQ, (snap) => {
                let classes = [];
                snap.forEach((d) => classes.push({ id: d.id, ...d.data() }));
                classes.sort(
                  (a, b) =>
                    (a.startTime?.toMillis() || 0) -
                    (b.startTime?.toMillis() || 0)
                );
                setLiveClasses(classes);
              });
            }

            if (schoolId) {
              const noticeQ = query(
                collection(db, "notices"),
                where("schoolId", "==", schoolId)
              );
              onSnapshot(noticeQ, (snap) => {
                let notices = [];
                snap.forEach((d) => notices.push({ id: d.id, ...d.data() }));
                notices.sort(
                  (a, b) =>
                    (b.createdAt?.toMillis() || 0) -
                    (a.createdAt?.toMillis() || 0)
                );
                if (notices.length > 0) setNotice(notices[0]);
              });
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const getFirstName = (fullName) => {
    return fullName.split(" ")[0];
  };

  const menuItems = [
    { id: "courses", icon: FaChalkboardTeacher, color: "text-blue-600", bg: "bg-blue-50", label: "Lectures" },
    { id: "materials", icon: FaBookOpen, color: "text-indigo-600", bg: "bg-indigo-50", label: "Materials" },
    { id: "assignments", icon: FaClipboardList, color: "text-emerald-600", bg: "bg-emerald-50", label: "Assignments" },
    { id: "tests", icon: FaLaptopCode, color: "text-purple-600", bg: "bg-purple-50", label: "Tests" },
    { id: "results", icon: FaTrophy, color: "text-amber-500", bg: "bg-amber-50", label: "Results" },
    { id: "doubts", icon: FaQuestionCircle, color: "text-rose-500", bg: "bg-rose-50", label: "Doubts" },
    { id: "attendance", icon: FaCalendarCheck, color: "text-teal-600", bg: "bg-teal-50", label: "Attendance" },
    { id: "fees", icon: FaWallet, color: "text-cyan-600", bg: "bg-cyan-50", label: "Fees" },
  ];

  const extraItems = [
    { id: "leave", icon: FaCalendarAlt, color: "text-orange-500", bg: "bg-orange-50", label: "Leave" },
    { id: "timetable", icon: FaRegClock, color: "text-indigo-500", bg: "bg-indigo-50", label: "Timetable" },
    { id: "gallery", icon: FaImages, color: "text-pink-500", bg: "bg-pink-50", label: "Gallery" },
    { id: "complaints", icon: FaCommentDots, color: "text-red-500", bg: "bg-red-50", label: "Complaint" },
    { id: "feedback", icon: FaCommentAlt, color: "text-sky-500", bg: "bg-sky-50", label: "Feedback" },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-28 font-sans text-slate-800 selection:bg-indigo-100">
      {/* Premium Dark Header */}
      <div className="bg-slate-900 text-white px-6 pt-12 pb-24 rounded-b-[40px] relative overflow-hidden">
        {/* Subtle geometric accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500 rounded-full blur-[80px]"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-500 rounded-full blur-[90px]"></div>
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={userData.photoUrl}
                alt="Profile"
                className="w-14 h-14 rounded-full border border-white/20 shadow-lg object-cover bg-slate-800"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">
                {greeting}
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                {getFirstName(userData.name)}
              </h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 active:scale-95 border border-white/10"
          >
            <FaPowerOff className="text-sm" />
          </button>
        </div>

        {/* Minimalist Info Cards */}
        <div className="flex justify-between mt-8 relative z-10">
           <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 flex-1 mr-3 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
               <FaGraduationCap className="text-sm" />
             </div>
             <div>
               <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Class</span>
               <span className="text-white font-semibold text-sm">{userData.batchName}</span>
             </div>
           </div>
           <div className="bg-white/5 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 flex-1 ml-3 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
               <FaUser className="text-sm" />
             </div>
             <div>
               <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">ID</span>
               <span className="text-white font-semibold text-sm">{userData.studentId}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 -mt-10 relative z-20 max-w-xl mx-auto space-y-6">
        
        {/* Next Live Class Alert */}
        {liveClasses.length > 0 && (
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex justify-between items-center transform transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[16px] bg-rose-50 flex items-center justify-center text-rose-500 relative">
                 <FaVideo className="text-xl" />
                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full animate-ping"></span>
                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md mb-1 inline-block">Live Soon</span>
                <h3 className="font-bold text-slate-800 text-sm">{liveClasses[0].topic}</h3>
                <p className="text-xs text-slate-500 font-medium">{liveClasses[0].subject} • {new Date(liveClasses[0].startTime?.toMillis() || 0).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/live-classes")}
              className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-md"
            >
              <FaPlay className="text-xs ml-0.5" />
            </button>
          </div>
        )}

        {/* Clean Grid Layout */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-4 px-1">Quick Access</h2>
          <div className="grid grid-cols-3 gap-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className="bg-white rounded-[20px] p-4 flex flex-col items-center gap-3 cursor-pointer border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] active:scale-95 transition-all"
              >
                <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} text-xl`}>
                  <item.icon />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 tracking-tight">
                  {item.label}
                </span>
              </div>
            ))}

            {/* More Toggles */}
            {!showAllIcons && (
              <div
                onClick={() => setShowAllIcons(true)}
                className="bg-slate-50 rounded-[20px] p-4 flex flex-col items-center gap-3 cursor-pointer border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] active:scale-95 transition-all hover:bg-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 text-xl">
                  <FaEllipsisH />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 tracking-tight">
                  More
                </span>
              </div>
            )}

            {showAllIcons && (
              <>
                {extraItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/${item.id}`)}
                    className="bg-white rounded-[20px] p-4 flex flex-col items-center gap-3 cursor-pointer border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] active:scale-95 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} text-xl`}>
                      <item.icon />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 tracking-tight">
                      {item.label}
                    </span>
                  </div>
                ))}
                <div
                  onClick={() => setShowAllIcons(false)}
                  className="bg-slate-50 rounded-[20px] p-4 flex flex-col items-center gap-3 cursor-pointer border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] active:scale-95 transition-all hover:bg-slate-100"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 text-xl">
                    <FaEllipsisH />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 tracking-tight">
                    Less
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notice Board Section */}
        <div className="pt-2">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-base font-bold text-slate-800">Notice Board</h2>
            <button
              onClick={() => navigate("/notices")}
              className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-700 active:scale-95 transition-all"
            >
              View All
            </button>
          </div>
          <div>
            {!notice ? (
              <div className="bg-white rounded-[24px] p-6 text-center border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                   <FaBell className="text-xl" />
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  No new announcements.
                </p>
              </div>
            ) : (
              <div onClick={() => navigate("/notices")} className="bg-white p-5 rounded-[24px] flex items-start gap-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-[16px] bg-amber-50 flex items-center justify-center shrink-0 text-amber-500">
                  <FaBullhorn className="text-xl" />
                </div>
                <div className="flex-1 pr-2 pt-1">
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5 leading-tight">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                    {notice.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Floating Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-5 pb-5 pt-2 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto bg-slate-900 backdrop-blur-xl rounded-[28px] flex justify-around items-center p-2.5 shadow-2xl pointer-events-auto border border-white/10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex flex-col items-center justify-center w-12 h-12 bg-white/10 rounded-2xl text-white transition-all shadow-sm"
          >
            <FaHome className="text-[18px]" />
          </button>
          <button
            onClick={() => navigate("/live-classes")}
            className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 hover:text-white transition-colors"
          >
            <FaPlay className="text-[18px]" />
          </button>
          <button
            onClick={() => navigate("/tests")}
            className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 hover:text-white transition-colors relative"
          >
            <FaEdit className="text-[18px]" />
          </button>
          <button
            onClick={() => navigate("/notices")}
            className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 hover:text-white transition-colors relative"
          >
            <FaBell className="text-[18px]" />
            {notice && <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 hover:text-white transition-colors"
          >
            <FaUser className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
INNER_EOF
