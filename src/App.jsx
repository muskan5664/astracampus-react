import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase-init';
import { doc, getDoc } from 'firebase/firestore';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Lectures from './pages/Lectures';
import Courses from './pages/Courses';
import CourseSubjects from './pages/CourseSubjects';
import Attendance from './pages/Attendance';
import Fees from './pages/fees';
import Doubts from './pages/Doubts';
import Materials from './pages/Materials';
import Assignments from './pages/Assignments';
import Tests from './pages/Tests'; 
import LiveClasses from './pages/LiveClasses';
import Complaints from './pages/Complaints';
import Feedback from './pages/Feedback';
import Leave from './pages/Leave';
import Timetable from './pages/Timetable';
import Gallery from './pages/Gallery';
import Notices from './pages/Notices';
import Results from './pages/Results';

import AddResults from './pages/AddResults';
import CreateAssignment from './pages/CreateAssignment';
import ManageClasses from './pages/ManageClasses';
import ManageDoubts from './pages/ManageDoubts';
import ManageGallery from './pages/ManageGallery';
import ManageMaterials from './pages/ManageMaterials';
import ManageNotices from './pages/ManageNotices';
import ManageFees from './pages/ManageFees';
import ManageComplaints from './pages/ManageComplaints';
import ManageAttendance from './pages/ManageAttendance';
import ManageStaff from './pages/ManageStaff';
import ManageStudents from './pages/ManageStudents';
import ManageTests from './pages/ManageTests';
import ManageTimetable from './pages/ManageTimetable';
import ManageLeaves from './pages/ManageLeaves';
import TeacherDashboard from './pages/TeacherDashboard';
import UploadVideo from './pages/UploadVideo';
import ViewResults from './pages/ViewResults';
import ViewFeedback from './pages/ViewFeedback';
import ManageInstitutes from './pages/ManageInstitutes';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || 'student');
          } else {
            setRole('student');
          }
        } catch(e) {
          console.error("Error fetching user role:", e);
          setRole('student');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/course-subjects" element={<ProtectedRoute><CourseSubjects /></ProtectedRoute>} />
        <Route path="/lectures" element={<ProtectedRoute><Lectures /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/fees" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
        <Route path="/doubts" element={<ProtectedRoute><Doubts /></ProtectedRoute>} />
        <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
        <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
        <Route path="/live-classes" element={<ProtectedRoute><LiveClasses /></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
        <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
        <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
        <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />

        {/* New Admin / Teacher Routes */}
        <Route path="/add-results" element={<ProtectedRoute allowedRoles={['teacher', 'staff', 'admin']}><AddResults /></ProtectedRoute>} />
        <Route path="/create-assignment" element={<ProtectedRoute allowedRoles={['teacher', 'staff', 'admin']}><CreateAssignment /></ProtectedRoute>} />
        <Route path="/manage-classes" element={<ProtectedRoute allowedRoles={['admin']}><ManageClasses /></ProtectedRoute>} />
        <Route path="/manage-doubts" element={<ProtectedRoute allowedRoles={['admin']}><ManageDoubts /></ProtectedRoute>} />
        <Route path="/manage-gallery" element={<ProtectedRoute allowedRoles={['admin']}><ManageGallery /></ProtectedRoute>} />
        <Route path="/manage-materials" element={<ProtectedRoute allowedRoles={['admin']}><ManageMaterials /></ProtectedRoute>} />
        <Route path="/manage-notices" element={<ProtectedRoute allowedRoles={['admin']}><ManageNotices /></ProtectedRoute>} />
        <Route path="/manage-fees" element={<ProtectedRoute allowedRoles={['admin']}><ManageFees /></ProtectedRoute>} />
        <Route path="/manage-complaints" element={<ProtectedRoute allowedRoles={['admin']}><ManageComplaints /></ProtectedRoute>} />
        <Route path="/manage-attendance" element={<ProtectedRoute allowedRoles={['admin']}><ManageAttendance /></ProtectedRoute>} />
        <Route path="/manage-staff" element={<ProtectedRoute allowedRoles={['admin']}><ManageStaff /></ProtectedRoute>} />
        <Route path="/manage-students" element={<ProtectedRoute allowedRoles={['admin']}><ManageStudents /></ProtectedRoute>} />
        <Route path="/manage-tests" element={<ProtectedRoute allowedRoles={['admin']}><ManageTests /></ProtectedRoute>} />
        <Route path="/manage-timetable" element={<ProtectedRoute allowedRoles={['admin']}><ManageTimetable /></ProtectedRoute>} />
        <Route path="/manage-leaves" element={<ProtectedRoute allowedRoles={['admin']}><ManageLeaves /></ProtectedRoute>} />
        <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={['teacher', 'staff', 'admin']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/upload-video" element={<ProtectedRoute allowedRoles={['teacher', 'staff', 'admin']}><UploadVideo /></ProtectedRoute>} />
        <Route path="/view-results" element={<ProtectedRoute allowedRoles={['teacher', 'staff', 'admin']}><ViewResults /></ProtectedRoute>} />
        <Route path="/view-feedback" element={<ProtectedRoute allowedRoles={['teacher', 'staff', 'admin']}><ViewFeedback /></ProtectedRoute>} />
        <Route path="/manage-institutes" element={<ProtectedRoute allowedRoles={['admin']}><ManageInstitutes /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
