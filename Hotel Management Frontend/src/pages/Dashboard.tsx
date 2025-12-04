import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';
import { useAppContext } from '../context/AppContext';

interface Stats {
  totalRooms: number;
  availableRooms: number;
  totalFoodItems: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [stats, setStats] = useState<Stats>({ totalRooms: 0, availableRooms: 0, totalFoodItems: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = state.auth.user?.email === 'admin@hotel.com';

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        // fetch rooms and food items in parallel
        const [roomsResponse, foodResponse] = await Promise.all([
          apiClient.get('/rooms?size=1000'),
          apiClient.get('/food-items?size=1000')
        ]);

        if (!mounted) return;

        const rooms = roomsResponse?.data?.content ?? roomsResponse?.data ?? [];
        const availableRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r?.available).length : 0;
        const foodItems = foodResponse?.data?.content ?? foodResponse?.data ?? [];

        setStats({
          totalRooms: Array.isArray(rooms) ? rooms.length : 0,
          availableRooms,
          totalFoodItems: Array.isArray(foodItems) ? foodItems.length : 0
        });
      } catch (error: any) {
        if (!mounted) return;
        const msg = error?.response?.data?.message ?? 'Failed to load stats';
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const actionCards = useMemo(
    () => [
      {
        title: 'Book a Room',
        description: 'Browse and book from our selection of premium rooms',
        icon: '🏨',
        gradient: 'from-blue-600 to-indigo-700',
        action: () => navigate('/home')
      },
      {
        title: 'Order Food',
        description: 'Explore our delicious menu and place your order',
        icon: '🍽️',
        gradient: 'from-orange-400 to-red-500',
        action: () => navigate('/home')
      },
      {
        title: 'My Bookings',
        description: 'View and manage your current and past bookings',
        icon: '📋',
        gradient: 'from-green-500 to-teal-600',
        action: () => navigate('/bookings')
      }
    ],
    [navigate]
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="pt-16">
        {/* HERO */}
        <section className="bg-gradient-to-r from-[#003580] to-[#0056D6] text-white py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg p-4 md:p-8 md:flex md:items-start md:gap-8">
              <div className="md:w-2/3">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 leading-tight normal-case">
                  Welcome to Hotel Paradise
                </h1>

                <p className="text-base sm:text-lg text-blue-100 max-w-3xl mb-5">
                  Experience luxury and comfort. Book your perfect stay with us today.
                </p>

                <div className="flex flex-wrap gap-3">
                  {isAdmin && (
                    <button
                      onClick={() => navigate('/admin')}
                      aria-label="Go to admin dashboard"
                      className="px-6 py-2 text-sm bg-red-500 text-white rounded-md font-bold hover:bg-red-600 transition-shadow shadow-sm focus:outline-none focus:ring-4 focus:ring-red-500/30"
                    >
                      ⚙️ Admin Dashboard
                    </button>
                  )}
                </div>
              </div>

              <div className="md:w-1/3 mt-4 md:mt-0 hidden md:flex items-center justify-end">
                <div
                  className="w-40 h-28 bg-white/8 rounded-md flex items-center justify-center text-white/70"
                  aria-hidden="true"
                >
                  <span className="text-3xl">🏨</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-3">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 animate-pulse"
                  aria-hidden="true"
                >
                  <div className="h-6 w-6 bg-neutral-200 rounded mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/5 mb-2"></div>
                  <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 flex items-center gap-4">
                <div className="text-3xl" aria-hidden>
                  🏨
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Rooms</div>
                  <div className="font-heading text-2xl font-bold text-[#0056D6]">{stats.totalRooms}</div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 flex items-center gap-4">
                <div className="text-3xl" aria-hidden>
                  ✨
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Available Now</div>
                  <div className="font-heading text-2xl font-bold text-green-600">{stats.availableRooms}</div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 flex items-center gap-4">
                <div className="text-3xl" aria-hidden>
                  🍽️
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Menu Items</div>
                  <div className="font-heading text-2xl font-bold text-orange-600">{stats.totalFoodItems}</div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Action Cards Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-semibold mb-6 text-center">What would you like to do?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {actionCards.map((card, index) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                onClick={card.action}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.action();
                  }
                }}
                aria-label={card.title}
                className={`cursor-pointer rounded-lg overflow-hidden shadow transition-transform hover:shadow-lg transform hover:scale-[1.02] flex h-full bg-gradient-to-br ${card.gradient}`}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="text-3xl mb-3" aria-hidden>
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                  <p className="text-sm text-white/90 mb-4">{card.description}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      card.action();
                    }}
                    aria-label={`Start ${card.title}`}
                    className="mt-auto inline-block bg-white text-[#0056D6] px-3 py-2 rounded-md font-semibold focus:outline-none focus:ring-4 focus:ring-white/25"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <h2 className="font-heading text-4xl font-bold text-center text-gray-900 mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-center max-w-5xl">
              <div className="text-center">
                <div className="text-3xl mb-4" aria-hidden>
                  🌟
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">Luxury accommodations with world-class amenities</p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-4" aria-hidden>
                  ⚡
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">Instant Booking</h3>
                <p className="text-gray-600">Quick and easy reservation process</p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-4" aria-hidden>
                  💰
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">Best Prices</h3>
                <p className="text-gray-600">Competitive rates with no hidden fees</p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-4" aria-hidden>
                  🤝
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600">Round-the-clock customer assistance</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
