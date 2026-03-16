import { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Search, Bell, Menu, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import * as notificationService from '../services/notifications';
import { formatDistanceToNow } from 'date-fns';

const Navbar = ({ onMenuClick }) => {
    const { user, logout, profile } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getNotifications();
            const notificationList = data.results || [];
            setNotifications(notificationList);
            setUnreadCount(notificationList.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Poll for new notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user, fetchNotifications]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        setIsNotificationOpen(false);
    };

    const toggleNotification = () => {
        setIsNotificationOpen(!isNotificationOpen);
        setIsDropdownOpen(false);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const displayName = profile?.name || user?.username || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <header className="h-20 lg:h-24 flex items-center justify-between px-4 md:px-8 bg-background">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 md:gap-8">
                {/* <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-600 cursor-pointer hover:text-primary transition-colors" /> */}

                <div className="relative" ref={notificationRef}>
                    <div 
                        className={`p-2 rounded-xl transition-all cursor-pointer ${isNotificationOpen ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
                        onClick={toggleNotification}
                    >
                        <Bell className="w-5 h-5 md:w-6 md:h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 bg-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-background animate-in zoom-in">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>

                    {/* Notifications Dropdown */}
                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in duration-200 origin-top-right overflow-hidden flex flex-col">
                            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllRead}
                                        className="text-xs font-semibold text-primary hover:underline transition-all"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notif) => (
                                            <div 
                                                key={notif.id}
                                                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                                className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group ${!notif.is_read ? 'bg-primary/[0.02]' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-primary shadow-[0_0_8px_rgba(90,106,207,0.6)]' : 'bg-transparent'}`} />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                                                {notif.title}
                                                            </p>
                                                            <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                            <Bell className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">No notifications yet</p>
                                        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                                            When you have new alerts, they will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        End of notifications
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center gap-2 md:gap-3 border-l-2 border-gray-200 pl-4 md:pl-8 cursor-pointer group"
                        onClick={toggleDropdown}
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                            {initials}
                        </div>
                        <div className="hidden sm:flex items-center gap-2 group-hover:text-primary transition-colors">
                            <span className="text-sm font-semibold text-gray-700">{displayName}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-50 flex flex-col gap-0.5 mb-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                            </div>
                            
                            <Link 
                                to="/profile" 
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors group/item"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium">My Profile</span>
                            </Link>

                            <Link 
                                to="/settings" 
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors group/item"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                                    <Settings className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="font-medium">Settings</span>
                            </Link>

                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-danger/5 transition-colors group/item"
                            >
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover/item:bg-danger/10 transition-colors">
                                    <LogOut className="w-4 h-4 text-danger" />
                                </div>
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;