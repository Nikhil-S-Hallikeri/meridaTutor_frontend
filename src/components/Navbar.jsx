import { Search, Bell } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { logout } = useContext(AuthContext);

    return (
        <header className="h-24 flex items-center justify-between px-8 bg-background">
            {/* Left side can be empty or hold a page title later */}
            <div></div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-8">
                <Search className="w-6 h-6 text-gray-600 cursor-pointer hover:text-primary transition-colors" />

                <div className="relative">
                    <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-primary transition-colors" />
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        3
                    </span>
                </div>

                {/* Profile Dropdown / Logout Trigger */}
                <div
                    className="flex items-center gap-4 border-l-2 border-gray-200 pl-8 cursor-pointer group"
                    onClick={logout}
                    title="Click to Logout"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">Admin User</p>
                        <p className="text-xs text-gray-500">Logout</p>
                    </div>
                    <img
                        src="https://ui-avatars.com/api/?name=Admin+User&background=5A6ACF&color=fff"
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-sm"
                    />
                </div>
            </div>
        </header>
    );
};

export default Navbar;