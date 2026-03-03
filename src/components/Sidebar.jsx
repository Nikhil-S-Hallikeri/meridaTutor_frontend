import { NavLink } from 'react-router-dom';
import { Home, PieChart, Users, BookOpen, Calendar, Settings } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
        { name: 'Leads', path: '/admin/leads', icon: PieChart },
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Trainers', path: '/admin/trainers', icon: BookOpen },
        { name: 'Batches', path: '/admin/batches', icon: Calendar },
    ];

    return (
        <div className="w-20 lg:w-64 bg-primary h-full flex flex-col text-white transition-all duration-300 rounded-r-3xl">
            {/* Logo Area */}
            <div className="h-24 flex items-center justify-center">
                <h2 className="text-3xl font-bold hidden lg:block tracking-wide">Merida</h2>
                <h2 className="text-3xl font-bold lg:hidden">M</h2>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-6 space-y-3 px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-white text-primary font-bold shadow-lg'
                                : 'text-white/80 hover:bg-white/20 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6 shrink-0" />
                        <span className="hidden lg:block text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Settings / Logout Area */}
            <div className="p-4 mb-6">
                <NavLink to="/admin/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/80 hover:bg-white/20">
                    <Settings className="w-6 h-6" />
                    <span className="hidden lg:block text-sm">Settings</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;