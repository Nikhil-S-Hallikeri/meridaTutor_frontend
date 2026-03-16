import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Initialize React Hook Form
    const { register, handleSubmit, formState: { errors } } = useForm();

    // Submit Handler
    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMsg('');
        
        // CRITICAL: Clear existing tokens before attempting a new login
        // to prevent 401 errors from expired old tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        try {
            // Using the centralized api service
            const response = await api.post('/api/login/', {
                email: data.email,
                password: data.password,
            });

            console.log("🔥 BACKEND RESPONSE:", response.data);

            const userRole = response.data.role ? response.data.role.toLowerCase() : '';

            if (!userRole) {
                setErrorMsg("Login successful, but no role was returned from the server.");
                setIsLoading(false);
                return;
            }

            // Pass the response data to our context
            login(response.data, response.data.role);

        } catch (error) {
            setErrorMsg(error.response?.data?.detail || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background items-center justify-center">
            {/* Login Card matched to your Figma clean aesthetic */}
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-medium text-primary mb-2">Merida Tuition</h1>
                    <p className="text-gray-500">Welcome back! Please login to your account.</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="example@gmail.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <Link to="/forgot-password" xml:id="forgot-password-link" className="text-sm text-primary hover:underline">Forgot Password?</Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register('password', { required: 'Password is required' })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 pointer-events-none" />
                                ) : (
                                    <Eye className="w-5 h-5 pointer-events-none" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;