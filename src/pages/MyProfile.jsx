import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateMyProfile, getMyProfile } from '../services/auth';
import { toast } from 'react-toastify';
import { Edit2, Save, X, Phone, Mail, MapPin, User, Shield, Calendar, Briefcase, GraduationCap, DollarSign, Clock, Layout, CreditCard } from 'lucide-react';

const MyProfile = () => {
    const { user, profile } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (profile) {
            setFormData(profile);
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateMyProfile(formData);
            toast.success('Profile updated successfully!');
            // Refresh local profile in context
            await getMyProfile();
            window.location.reload(); 
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    if (!user) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    const displayName = profile?.name || user.username;
    const employeeId = profile?.admission_no || profile?.staff_id || profile?.tutor_id || 'N/A';
    
    // Harmonize phone field names across roles
    const phoneFieldName = user.role === 'student' ? 'phone' : 
                          (user.role === 'ADMIN' ? 'phone_number' : 'contact');

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{displayName}</h1>
                    <p className="text-gray-500 text-sm mt-1">({employeeId})</p>
                </div>
                <div className="flex gap-3">
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Basic Information Section */}
            <SectionCard title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <InfoField label="ID" value={employeeId} />
                    <InfoField label="Phone Number" name={phoneFieldName} value={formData[phoneFieldName] || ''} isEditing={isEditing} onChange={handleInputChange} />
                    <InfoField label="Name" name={user.role === 'ADMIN' ? 'username' : 'name'} value={formData.name || formData.username || ''} isEditing={isEditing} onChange={handleInputChange} />
                    <InfoField label="Email ID" value={user.email} />
                    <InfoField label="Address" name="address" value={formData.address || ''} isEditing={isEditing} onChange={handleInputChange} />
                </div>
            </SectionCard>

            {/* Work/Account Information Section */}
            <SectionCard title="Work Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {user.role === 'STAFF' && (
                        <>
                            <InfoField label="Department" value={profile?.department || 'N/A'} />
                            <InfoField label="Employement Type" value={profile?.employment_type || 'N/A'} className="capitalize" />
                            <InfoField label="Designation" value={profile?.role_title || 'N/A'} />
                            <InfoField label="Employment Status" value={profile?.status || 'N/A'} className="capitalize" />
                            <InfoField label="Salary" value={profile?.salary ? `₹${profile.salary}` : 'N/A'} />
                            <InfoField label="Date of Joining" value={profile?.joined_date || 'N/A'} />
                        </>
                    )}
                    
                    {user.role === 'TUTOR' && (
                        <>
                            <InfoField label="Experience" name="experience" value={formData.experience || ''} isEditing={isEditing} onChange={handleInputChange} />
                            <InfoField label="Charges Per Hour" value={profile?.charges_per_hour ? `₹${profile.charges_per_hour}` : 'N/A'} />
                            <InfoField label="Qualification" name="qualifications" value={formData.qualifications || ''} isEditing={isEditing} onChange={handleInputChange} />
                            <InfoField label="Date of Joining" value={profile?.joined_date || 'N/A'} />
                            <InfoField label="Availability" name="availability" value={formData.availability || ''} isEditing={isEditing} onChange={handleInputChange} />
                            <InfoField label="Account Status" value={user.is_active ? 'Active' : 'Inactive'} />
                        </>
                    )}

                    {user.role === 'student' && (
                        <>
                            <InfoField label="Admission No" value={profile?.admission_no || 'N/A'} />
                            <InfoField label="Date of Birth" value={profile?.dob || 'N/A'} />
                            <InfoField label="Gender" value={profile?.gender || 'N/A'} />
                            <InfoField label="Date of Joining" value={profile?.join_date || 'N/A'} />
                            <InfoField label="Qualification" name="qualification" value={formData.qualification || ''} isEditing={isEditing} onChange={handleInputChange} />
                            <InfoField label="Status" value={profile?.status || 'N/A'} className="capitalize" />
                        </>
                    )}

                    {(user.role === 'ADMIN' || !['TUTOR', 'STAFF', 'student'].includes(user.role)) && (
                        <>
                            <InfoField label="Role" value={user.role} />
                            <InfoField label="Username" value={user.username} />
                            <InfoField label="Account Status" value={user.is_active ? 'Active' : 'Inactive'} />
                        </>
                    )}
                </div>
            </SectionCard>

            {/* Additional Information Section (Conditional) */}
            {(user.role === 'student' || profile?.emergency_contact) && (
                <SectionCard title={user.role === 'student' ? "Guardian & Emergency Information" : "Emergency Contact"}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {user.role === 'student' && (
                            <>
                                <InfoField label="Guardian Name" name="guardian_name" value={formData.guardian_name || ''} isEditing={isEditing} onChange={handleInputChange} />
                                <InfoField label="Guardian Contact" name="guardian_contact" value={formData.guardian_contact || ''} isEditing={isEditing} onChange={handleInputChange} />
                                <InfoField label="Relation" name="guardian_relation" value={formData.guardian_relation || ''} isEditing={isEditing} onChange={handleInputChange} />
                            </>
                        )}
                        <InfoField label="Emergency Contact" name="emergency_contact" value={formData.emergency_contact || ''} isEditing={isEditing} onChange={handleInputChange} />
                    </div>
                </SectionCard>
            )}
        </div>
    );
};

const SectionCard = ({ title, children }) => (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

const InfoField = ({ label, value, name, isEditing, onChange, className = "" }) => (
    <div className="flex flex-col gap-1.5 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
        <label className="text-xs font-medium text-gray-400 capitalize tracking-wide">{label}</label>
        {isEditing && onChange && !['ID', 'Email ID', 'Role', 'Username', 'Admission No', 'Date of Birth', 'Gender', 'Date of Joining', 'Employment Status', 'Employement Type', 'Department', 'Designation', 'Salary', 'Account Status', 'Status'].includes(label) ? (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
        ) : (
            <p className={`text-sm font-medium text-gray-600 ${className}`}>
                {value || '--'}
            </p>
        )}
    </div>
);

export default MyProfile;
