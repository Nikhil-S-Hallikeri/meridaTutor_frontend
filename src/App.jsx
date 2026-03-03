import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './layouts/AdminLayout';


const Unauthorized = () => <div className="p-10 text-red-500 text-2xl">Access Denied</div>;

// Role Dashboards
const TrainerDashboard = () => <div className="p-10 text-green-600 text-2xl">Trainer Dashboard</div>;
const StudentDashboard = () => <div className="p-10 text-orange-600 text-2xl">Student Dashboard</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path="/admin/leads" element={<div>Leads Page Coming Soon</div>} />
              <Route path="/admin/students" element={<div>Students Page Coming Soon</div>} />

            </Route>

          </Route>

          <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;