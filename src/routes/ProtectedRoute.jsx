import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // Check if user is logged in
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role'); // e.g., 'admin', 'student'

  if (!token) {
    // Not logged in -> login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // wrong role -> unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // everything is good -> render the child routes (the actual page)
  return <Outlet />;
};

export default ProtectedRoute;