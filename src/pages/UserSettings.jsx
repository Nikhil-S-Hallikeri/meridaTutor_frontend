import React, { useState } from 'react';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { changePassword } from '../services/auth';

const UserSettings = () => {
    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-display">Account Settings</h1>
                <p className="text-gray-500 mt-1">Manage your security and account credentials.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <SecuritySettings />
            </div>
        </div>
    );
};

const SecuritySettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.new_password !== formData.confirm_password) {
            toast.error('New passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(formData);
            toast.success('Password updated successfully!');
            setFormData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || error.response?.data?.confirm_password?.[0] || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                <p className="text-gray-500 text-sm mt-1">Update your password to keep your account secure.</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md space-y-6">
                <div className="space-y-4">
                    <SettingsField 
                        label="Current Password" 
                        name="old_password"
                        type="password" 
                        value={formData.old_password}
                        onChange={handleChange}
                        required 
                    />
                    <SettingsField 
                        label="New Password" 
                        name="new_password"
                        type="password" 
                        value={formData.new_password}
                        onChange={handleChange}
                        required 
                    />
                    <SettingsField 
                        label="Confirm New Password" 
                        name="confirm_password"
                        type="password" 
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Use at least 8 characters. Include a mix of uppercase and lowercase letters, numbers, and symbols.
                    </p>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                    {isLoading ? 'Updating...' : 'Save Password'}
                </button>
            </form>
        </div>
    );
};

const SettingsField = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        <input 
            {...props}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
        />
    </div>
);


export default UserSettings;
