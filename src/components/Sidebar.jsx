import { NavLink } from 'react-router-dom';
import { Home, PieChart, Users, BookOpen, Calendar, FileText, Settings, ClipboardList, Bell, DollarSign, Star } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const userRole = user?.role?.toUpperCase() || localStorage.getItem('user_role')?.toUpperCase();

    const allNavItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: Home, roles: ['ADMIN', 'STAFF'] },
        { name: 'Dashboard', path: '/trainer/dashboard', icon: Home, roles: ['TUTOR'] },
        { name: 'Dashboard', path: '/student/dashboard', icon: Home, roles: ['STUDENT'] },
        { name: 'My Payouts', path: '/trainer/payouts', icon: DollarSign, roles: ['TUTOR'] },
        { name: 'Leads', path: '/admin/leads', icon: PieChart, roles: ['ADMIN', 'STAFF'] },
        { name: 'Students', path: '/admin/students', icon: Users, roles: ['ADMIN', 'STAFF'] },
        { name: 'Trainers', path: '/admin/trainers', icon: Users, roles: ['ADMIN', 'STAFF'] },
        { name: 'Trainer Payouts', path: '/admin/payouts', icon: DollarSign, roles: ['ADMIN', 'STAFF'] },
        { name: 'Batches', path: '/admin/batches', icon: Calendar, roles: ['ADMIN', 'STAFF', 'TUTOR', 'STUDENT'] },
        { name: 'Attendance', path: '/admin/attendance', icon: ClipboardList, roles: ['ADMIN', 'STAFF', 'TUTOR', 'STUDENT'] },
        { name: 'Invoices', path: '/admin/invoices', icon: FileText, roles: ['ADMIN', 'STAFF', 'STUDENT'] },
        { name: 'Quality Control', path: '/admin/quality-control', icon: Star, roles: ['ADMIN', 'STAFF'] },
        { name: 'Student Feedback', path: '/trainer/reviews', icon: Star, roles: ['TUTOR'] },
        { name: 'Events', path: '/admin/events', icon: Bell, roles: ['ADMIN', 'STAFF', 'TUTOR', 'STUDENT'] },
        { name: 'Staff', path: '/admin/staff', icon: Users, roles: ['ADMIN'] },
    ];

    // Filter items based on user role
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="w-64 lg:w-64 bg-primary h-full flex flex-col text-white transition-all duration-300 rounded-r-3xl">
            {/* Logo Area */}
            <div className="h-24 flex items-center justify-center">
                <h2 className="text-3xl font-medium tracking-wide">Merida</h2>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-6 space-y-3 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40 transition-colors">
                {navItems.map((item) => (
                    <NavLink
                        key={`${item.name}-${item.path}`}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-white text-primary font-medium shadow-lg'
                                : 'text-white/80 hover:bg-white/20 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6 shrink-0" />
                        <span className="text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mb-6">
                <NavLink to="/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/80 hover:bg-white/20">
                    <Settings className="w-6 h-6" />
                    <span className="text-sm">Settings</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;