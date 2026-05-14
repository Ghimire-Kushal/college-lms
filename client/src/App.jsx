import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminCourses from './pages/admin/Courses';
import AdminTimetable from './pages/admin/Timetable';
import AdminAttendance from './pages/admin/Attendance';
import AdminNotices from './pages/admin/Notices';
import AdminResults from './pages/admin/Results';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherNotes from './pages/teacher/Notes';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherResults from './pages/teacher/Results';
import TeacherNotices from './pages/teacher/Notices';

// Student
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentAttendance from './pages/student/Attendance';
import StudentNotes from './pages/student/Notes';
import StudentAssignments from './pages/student/Assignments';
import StudentResults from './pages/student/Results';
import StudentNotices from './pages/student/Notices';
import TeacherOnlineClasses from './pages/teacher/OnlineClasses';
import StudentOnlineClasses from './pages/student/OnlineClasses';
import Profile from './pages/Profile';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><Layout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="timetable" element={<AdminTimetable />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Teacher Routes */}
            <Route path="/teacher" element={<ProtectedRoute role="teacher"><Layout /></ProtectedRoute>}>
              <Route index element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherCourses />} />
              <Route path="attendance" element={<TeacherAttendance />} />
              <Route path="notes" element={<TeacherNotes />} />
              <Route path="assignments" element={<TeacherAssignments />} />
              <Route path="results" element={<TeacherResults />} />
              <Route path="notices" element={<TeacherNotices />} />
              <Route path="online-classes" element={<TeacherOnlineClasses />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute role="student"><Layout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="notes" element={<StudentNotes />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="notices" element={<StudentNotices />} />
              <Route path="online-classes" element={<StudentOnlineClasses />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
