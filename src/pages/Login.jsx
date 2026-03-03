import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize React Hook Form
    const { register, handleSubmit, formState: { errors } } = useForm();

    // Submit Handler
    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            // Calling the exact endpoint from your API Sheet
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
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
                    <h1 className="text-3xl font-bold text-primary mb-2">Merida Tuition</h1>
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
                            <a href="/forgot-password" className="text-sm text-primary hover:underline">Forgot Password?</a>
                        </div>
                        <input
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
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