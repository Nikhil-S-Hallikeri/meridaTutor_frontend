import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { KeyRound, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const newPassword = watch('new_password');

    useEffect(() => {
        if (!email) {
            toast.error('Session expired. Please request OTP again.');
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await api.post('/api/reset-password/', {
                email: email,
                otp: data.otp,
                new_password: data.new_password
            });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error resetting password. Check your OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <Link to="/forgot-password" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change Email
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                    <p className="text-gray-500 text-sm">We've sent an OTP to <span className="font-bold text-gray-700">{email}</span></p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* OTP Field */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit OTP</label>
                        <div className="relative">
                            <ShieldCheck className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                maxLength="6"
                                {...register('otp', { 
                                    required: 'OTP is required',
                                    pattern: { value: /^[0-9]{6}$/, message: 'Must be 6 digits' }
                                })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-3 focus:ring-primary/40 focus:border-primary outline-none transition-all placeholder:text-gray-300 tracking-[0.5em] font-mono text-center"
                                placeholder="000000"
                            />
                        </div>
                        {errors.otp && <p className="text-red-500 text-xs mt-1 font-medium">{errors.otp.message}</p>}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                            <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                {...register('new_password', { 
                                    required: 'Required',
                                    minLength: { value: 6, message: 'Min 6 characters' }
                                })}
                                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="w-5 h-5 pointer-events-none" />
                                ) : (
                                    <Eye className="w-5 h-5 pointer-events-none" />
                                )}
                            </button>
                        </div>
                        {errors.new_password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.new_password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                            <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                {...register('confirm_password', { 
                                    required: 'Required',
                                    validate: value => value === newPassword || 'Passwords do not match'
                                })}
                                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5 pointer-events-none" />
                                ) : (
                                    <Eye className="w-5 h-5 pointer-events-none" />
                                )}
                            </button>
                        </div>
                        {errors.confirm_password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirm_password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center shadow-lg shadow-black/5 active:scale-[0.98] mt-4"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
