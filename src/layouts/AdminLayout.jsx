import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-background font-sans overflow-hidden">
            {/* Persistent Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Persistent Navbar */}
                <Navbar />

                {/* The actual page content gets injected here via React Router */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background px-8 pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;