import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export function Header() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-[#003580] to-[#0056D6] shadow-md">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-white uppercase tracking-heading">
            🏨 Hotel Paradise
          </h1>
        </div>

        {/* Center: Navigation Links (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="font-heading text-sm font-bold text-white hover:text-[#F4B400] uppercase tracking-heading transition-colors"
            aria-label="View rooms"
          >
            Rooms
          </button>
          <button
            onClick={() => navigate('/')}
            className="font-heading text-sm font-bold text-white hover:text-[#F4B400] uppercase tracking-heading transition-colors"
            aria-label="View food menu"
          >
            Food
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="font-heading text-sm font-bold text-white hover:text-[#F4B400] uppercase tracking-heading transition-colors"
            aria-label="View my bookings"
          >
            My Bookings
          </button>
        </nav>

        {/* Right: User & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-sm text-blue-100 font-medium hidden sm:inline">
            Welcome, {user?.fullName || 'Guest'}
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="font-heading hidden sm:inline-block px-3 py-2 text-sm font-bold text-white bg-white/20 rounded-lg hover:bg-white/30 uppercase tracking-heading transition-all"
            aria-label="Go to dashboard"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="font-heading px-4 sm:px-6 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 uppercase tracking-heading transition-all shadow-md hover:shadow-lg"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
