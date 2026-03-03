import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('user_role');
        if (token && role) {
            setUser({ token, role });
        }
    }, []);

    const login = (accessData, role) => {
        // Save to localStorage so user stays logged in after refresh
        localStorage.setItem('access_token', accessData.access);
        localStorage.setItem('refresh_token', accessData.refresh);
        localStorage.setItem('user_role', role);

        setUser({ token: accessData.access, role });

        // Route them to the correct dashboard based on their role
        if (role === 'ADMIN' || role === 'STAFF') navigate('/admin/dashboard');
        else if (role === 'TRAINER') navigate('/trainer/dashboard');
        else if (role === 'STUDENT') navigate('/student/dashboard');
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};