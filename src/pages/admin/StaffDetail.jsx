import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStaffById } from '../../services/staff';
import {
    ArrowLeft, User, Phone, MapPin, Calendar,
    CreditCard, Clock, ShieldAlert, Briefcase,
    Mail, Heart, Shield, Loader2
} from 'lucide-react';

const DetailItem = ({ label, value, icon: Icon, accent }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
        <div className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">
            <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-sm font-semibold ${accent || 'text-gray-800'}`}>{value || 'Not provided'}</p>
        </div>
    </div>
);

const StaffDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: staff, isLoading, error } = useQuery({
        queryKey: ['staff', id],
        queryFn: () => getStaffById(id),
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em]">Retrieving Profile...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white rounded-4xl border border-gray-100 p-10 mt-10">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-8 max-w-sm">We couldn't load this staff member's record. This might be due to a connection error or insufficient permissions.</p>
            <button onClick={() => navigate('/admin/staff')} className="px-8 py-3 bg-gray-900 text-white font-medium rounded-xl active:scale-95 transition-all">Back to Staff</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/staff')}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-medium text-2xl">
                            {staff?.name?.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-medium text-gray-900">{staff?.name}</h1>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-widest ${staff?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {staff?.status}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">{staff?.role_title} • {staff?.department}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/admin/staff/create', { state: { staffData: staff, isEditMode: true } })}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all active:scale-95"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Personal & Professional */}
                <div className="md:col-span-2 space-y-8">
                    {/* Professional Info */}
                    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
                        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" /> Professional Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem icon={Briefcase} label="Role Title" value={staff?.role_title} />
                            <DetailItem icon={MapPin} label="Department" value={staff?.department} />
                            <DetailItem icon={Clock} label="Shift Schedule" value={staff?.shift_time} />
                            <DetailItem icon={Calendar} label="Employment Type" value={staff?.employment_type} accent="capitalize text-indigo-600 font-bold" />
                            <DetailItem icon={CreditCard} label="Monthly Salary" value={`₹${parseFloat(staff?.salary).toLocaleString()}`} />
                            <DetailItem icon={Calendar} label="Date Joined" value={staff?.joined_date} />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
                        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" /> Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem icon={Mail} label="Email Address" value={staff?.email} />
                            <DetailItem icon={Phone} label="Primary Contact" value={staff?.contact} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Security & Misc */}
                <div className="space-y-8">
                    {/* Security Info */}
                    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
                        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> System Access
                        </h3>
                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl border ${staff?.is_admin ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className={`w-4 h-4 ${staff?.is_admin ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-700">Administrative Access</span>
                                </div>
                                <p className={`text-sm font-semibold ${staff?.is_admin ? 'text-indigo-700' : 'text-gray-500'}`}>
                                    {staff?.is_admin ? 'Granted - Full Access' : 'Limited - No Admin Rights'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Support Info */}
                    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
                        <h3 className="text-sm font-medium text-gray-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-primary" /> Support Details
                        </h3>
                        <DetailItem icon={Heart} label="Emergency Contact" value={staff?.emergency_contact} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetail;
