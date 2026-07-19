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
  FaChevronRight,
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

  const [stats, setStats] = useState({ attendance: "--%", fees: "₹0" });
  const [badges, setBadges] = useState({ assignments: 0, tests: 0 });
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

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 font-sans text-slate-800">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white px-6 pt-10 pb-20 rounded-b-[40px] shadow-xl relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/4"></div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={userData.photoUrl}
                alt="Profile"
                className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover bg-white"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-indigo-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium tracking-wide">
                {greeting},
              </p>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                {getFirstName(userData.name)}
              </h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all text-white active:scale-95 border border-white/20 shadow-sm"
          >
            <FaPowerOff className="text-sm" />
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex justify-between mt-8 relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner">
           <div className="flex flex-col">
             <span className="text-blue-200 text-[10px] uppercase font-bold tracking-wider mb-1">Class</span>
             <span className="text-white font-semibold text-lg flex items-center gap-2"><FaGraduationCap className="text-indigo-200" /> {userData.batchName}</span>
           </div>
           <div className="w-[1px] bg-white/20"></div>
           <div className="flex flex-col">
             <span className="text-blue-200 text-[10px] uppercase font-bold tracking-wider mb-1">Student ID</span>
             <span className="text-white font-semibold text-lg">{userData.studentId}</span>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 -mt-8 relative z-20 max-w-xl mx-auto space-y-6">
        
        {/* Next Live Class Alert */}
        {liveClasses.length > 0 && (
          <div className="bg-white rounded-[24px] p-5 shadow-lg border border-slate-100 flex justify-between items-center transform transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner relative">
                 <FaVideo className="text-xl" />
                 <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full animate-ping"></span>
                 <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
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

        {/* Categories Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
            Academics <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">Portal</span>
          </h2>
          <div className="grid grid-cols-4 gap-y-6 gap-x-3">
            {[
              { id: "attendance", icon: FaCalendarCheck, color: "text-emerald-500", bg: "bg-emerald-50", label: "Attendance" },
              { id: "materials", icon: FaBookOpen, color: "text-blue-500", bg: "bg-blue-50", label: "Materials" },
              { id: "assignments", icon: FaClipboardList, color: "text-amber-500", bg: "bg-amber-50", label: "Assignments" },
              { id: "tests", icon: FaLaptopCode, color: "text-purple-500", bg: "bg-purple-50", label: "Tests" },
              { id: "results", icon: FaTrophy, color: "text-yellow-500", bg: "bg-yellow-50", label: "Results" },
              { id: "fees", icon: FaWallet, color: "text-teal-500", bg: "bg-teal-50", label: "Fees" },
              { id: "leave", icon: FaCalendarAlt, color: "text-rose-500", bg: "bg-rose-50", label: "Leave" },
              { id: "courses", icon: FaChalkboardTeacher, color: "text-indigo-500", bg: "bg-indigo-50", label: "Lectures" },
              { id: "doubts", icon: FaQuestionCircle, color: "text-pink-500", bg: "bg-pink-50", label: "Doubts" },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-[20px] ${item.bg} flex items-center justify-center ${item.color} text-xl shadow-sm border border-white/50 group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300`}>
                  <item.icon />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 text-center tracking-tight">
                  {item.label}
                </span>
              </div>
            ))}

            {/* More / Less Toggles */}
            {!showAllIcons && (
              <div
                onClick={() => setShowAllIcons(true)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-[20px] bg-slate-100 flex items-center justify-center text-slate-500 text-xl shadow-sm border border-slate-200 group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                  <FaEllipsisH />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 text-center tracking-tight">
                  More
                </span>
              </div>
            )}

            {showAllIcons && (
              <>
                {[
                  { id: "timetable", icon: FaRegClock, color: "text-indigo-500", bg: "bg-indigo-50", label: "Timetable" },
                  { id: "gallery", icon: FaImages, color: "text-pink-500", bg: "bg-pink-50", label: "Gallery" },
                  { id: "complaints", icon: FaCommentDots, color: "text-orange-500", bg: "bg-orange-50", label: "Complaint" },
                  { id: "feedback", icon: FaCommentAlt, color: "text-sky-500", bg: "bg-sky-50", label: "Feedback" },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/${item.id}`)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className={`w-14 h-14 rounded-[20px] ${item.bg} flex items-center justify-center ${item.color} text-xl shadow-sm border border-white/50 group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300`}>
                      <item.icon />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 text-center tracking-tight">
                      {item.label}
                    </span>
                  </div>
                ))}
                <div
                  onClick={() => setShowAllIcons(false)}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-[20px] bg-slate-100 flex items-center justify-center text-slate-500 text-2xl shadow-sm border border-slate-200 group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                    &times;
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 text-center tracking-tight">
                    Less
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notice Board Section */}
        <div className="pt-4">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-lg font-bold text-slate-800">Notice Board</h2>
            <button
              onClick={() => navigate("/notices")}
              className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-700 active:scale-95 transition-all"
            >
              View All
            </button>
          </div>
          <div>
            {!notice ? (
              <div className="bg-white rounded-[24px] p-6 text-center border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                   <FaBell className="text-xl" />
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  No new announcements.
                </p>
              </div>
            ) : (
              <div onClick={() => navigate("/notices")} className="bg-white p-5 rounded-[24px] flex items-start gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                <div className="w-12 h-12 rounded-[16px] bg-amber-50 flex items-center justify-center shrink-0 text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                  <FaBullhorn className="text-xl" />
                </div>
                <div className="flex-1 pr-2">
                  <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">
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

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[28px] flex justify-around items-center p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 rounded-2xl text-indigo-600 transition-all shadow-sm"
          >
            <FaHome className="text-xl mb-1" />
            <span className="text-[9px] font-bold tracking-wide">Home</span>
          </button>
          <button
            onClick={() => navigate("/live-classes")}
            className="flex flex-col items-center justify-center w-14 h-14 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <FaPlay className="text-xl mb-1" />
            <span className="text-[9px] font-bold tracking-wide">Classes</span>
          </button>
          <button
            onClick={() => navigate("/tests")}
            className="flex flex-col items-center justify-center w-14 h-14 text-slate-400 hover:text-indigo-500 transition-colors relative"
          >
            <FaEdit className="text-xl mb-1" />
            <span className="text-[9px] font-bold tracking-wide">Tests</span>
          </button>
          <button
            onClick={() => navigate("/notices")}
            className="flex flex-col items-center justify-center w-14 h-14 text-slate-400 hover:text-indigo-500 transition-colors relative"
          >
            <FaBell className="text-xl mb-1" />
            <span className="text-[9px] font-bold tracking-wide">Notices</span>
            {notice && <span className="absolute top-2 right-3 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center justify-center w-14 h-14 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <FaUser className="text-xl mb-1" />
            <span className="text-[9px] font-bold tracking-wide">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
INNER_EOF
