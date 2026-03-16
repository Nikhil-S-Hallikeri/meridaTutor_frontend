import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Leads from './pages/admin/Leads';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Students from './pages/admin/Students';
import StudentDetail from './pages/admin/StudentDetail';
import Tutors from './pages/admin/Tutors';
import Batches from './pages/admin/Batches';
import CreateStudent from './pages/admin/CreateStudent';
import Invoices from './pages/admin/Invoices';
import Attendance from './pages/admin/Attendance';
import Events from './pages/admin/Events';
import Settings from './pages/admin/Settings';
import Staff from './pages/admin/Staff';
import CreateStaff from './pages/admin/CreateStaff';
import StaffDetail from './pages/admin/StaffDetail';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ReceiptDetail from './pages/admin/ReceiptDetail';
import TutorPayouts from './pages/admin/TutorPayouts';
import AdminReviews from './pages/admin/AdminReviews';
import BatchDetail from './pages/admin/BatchDetail';
import CreateTutor from './pages/admin/CreateTutor';
import CreateEvent from './pages/admin/CreateEvent';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyProfile from './pages/MyProfile';
import UserSettings from './pages/UserSettings';
import TutorReviews from './pages/TutorReviews';
import MyPayouts from './pages/MyPayouts';


const Unauthorized = () => <div className="p-10 text-red-500 text-2xl">Access Denied</div>;

// Initialize the Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents refetching every time you switch browser tabs
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer position="top-center" autoClose={3000} />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* SHARED ADMIN LAYOUT ROUTES */}
            <Route element={<AdminLayout />}>
              
              {/* SENSITIVE ADMIN ONLY */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/leads" element={<Leads />} />
                <Route path="/admin/students" element={<Students />} />
                <Route path="/admin/students/:id" element={<StudentDetail />} />
                <Route path="/admin/students/create" element={<CreateStudent />} />
                <Route path="/admin/trainers" element={<Tutors />} />
                <Route path="/admin/trainers/create" element={<CreateTutor />} />
                <Route path="/admin/staff" element={<Staff />} />
                <Route path="/admin/staff/:id" element={<StaffDetail />} />
                <Route path="/admin/staff/create" element={<CreateStaff />} />
                <Route path="/admin/payouts" element={<TutorPayouts />} />
                <Route path="/admin/quality-control" element={<AdminReviews />} />
              </Route>

              {/* TUTOR, ADMIN & STUDENT */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'TUTOR', 'STUDENT']} />}>
                <Route path="/admin/batches" element={<Batches />} />
                <Route path="/admin/attendance" element={<Attendance />} />
                <Route path="/admin/batches/:id" element={<BatchDetail />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'TUTOR']} />}>
                <Route path="/trainer/dashboard" element={<TutorDashboard />} />
                <Route path="/trainer/reviews" element={<TutorReviews />} />
                <Route path="/trainer/payouts" element={<MyPayouts />} />
              </Route>

              {/* STUDENT & ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'STUDENT']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/admin/invoices" element={<Invoices />} />
              </Route>

              {/* ALL AUTHENTICATED ROLES */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'TUTOR', 'STUDENT']} />}>
                <Route path="/admin/events" element={<Events />} />
                <Route path="/admin/events/create" element={<CreateEvent />} />
                <Route path="/admin/events/edit/:id" element={<CreateEvent />} />
                <Route path="/admin/receipts/:id" element={<ReceiptDetail />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/settings" element={<UserSettings />} />
              </Route>

            </Route>


          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;