import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await api.post('/api/forgot-password/', {
                email: data.email
            });
            toast.success('OTP sent to your email');
            navigate('/reset-password', { state: { email: data.email } });
        } catch (error) {
            toast.error(error.response?.data?.error || error.response?.data?.email?.[0] || 'Error sending OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 text-sm">Enter your email address and we'll send you an OTP to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                {...register('email', { required: 'Email is required' })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300"
                                placeholder="name@example.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center shadow-lg shadow-black/5 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Send OTP'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
