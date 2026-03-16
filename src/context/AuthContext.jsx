import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProfile = async (token, role) => {
        try {
            const data = await getMyProfile();
            setProfile(data.profile);
            setUser({ token, role, ...data.profile });
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            // If profile fails but token exists, we still have basic user
            setUser({ token, role });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('user_role');
        if (token && role) {
            fetchProfile(token, role);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (accessData, role) => {
        localStorage.setItem('access_token', accessData.access);
        localStorage.setItem('refresh_token', accessData.refresh);

        let normalizedRole = role.toUpperCase();
        if (normalizedRole === 'TRAINER') normalizedRole = 'TUTOR';
        localStorage.setItem('user_role', normalizedRole);

        // Fetch full profile immediately after login
        await fetchProfile(accessData.access, normalizedRole);

        if (normalizedRole === 'ADMIN' || normalizedRole === 'STAFF') {
            navigate('/admin/dashboard');
        } else if (normalizedRole === 'TUTOR') {
            navigate('/trainer/dashboard');
        } else if (normalizedRole === 'STUDENT') {
            navigate('/student/dashboard');
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setProfile(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};