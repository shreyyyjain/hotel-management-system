import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      toast.error(msg);
      setError(msg);
      return;
    }

    setLoading(true);

    try {
      await authService.signup(email, password, fullName);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 px-4 py-8">
      <div className="w-full max-w-lg space-y-10 bg-white/95 backdrop-blur-sm p-12 sm:p-16 rounded-3xl shadow-2xl">
        <div className="space-y-4">
          <h2 className="font-heading text-5xl sm:text-6xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 uppercase">
            🏨 Hotel
          </h2>
          <p className="text-center text-xl sm:text-2xl text-green-600 font-semibold">
            Join us today!
          </p>
          <p className="text-center text-sm sm:text-base text-gray-600">
            Create your account to get started
          </p>
        </div>
        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="fullName" className="block text-base sm:text-lg font-bold text-gray-800">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 text-base sm:text-lg border-2 border-neutral-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(0,86,214,0.35)] focus:border-transparent transition-all bg-white"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="email" className="block text-base sm:text-lg font-bold text-gray-800">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 text-base sm:text-lg border-2 border-neutral-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(0,86,214,0.35)] focus:border-transparent transition-all bg-white"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="password" className="block text-base sm:text-lg font-bold text-gray-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 pr-16 text-base sm:text-lg border-2 border-neutral-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(0,86,214,0.35)] focus:border-transparent transition-all bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="block text-base sm:text-lg font-bold text-gray-800">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 pr-16 text-base sm:text-lg border-2 border-neutral-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(0,86,214,0.35)] focus:border-transparent transition-all bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="font-heading w-full py-4 sm:py-5 px-6 border-none rounded-2xl text-base sm:text-lg font-bold text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-heading transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-base text-gray-700">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-green-600 hover:text-blue-600 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
