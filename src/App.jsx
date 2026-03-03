import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';


const Unauthorized = () => <div className="p-10 text-red-500 text-2xl">Access Denied</div>;

// Role Dashboards
const AdminDashboard = () => <div className="p-10 text-blue-600 text-2xl">Admin Dashboard</div>;
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
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
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