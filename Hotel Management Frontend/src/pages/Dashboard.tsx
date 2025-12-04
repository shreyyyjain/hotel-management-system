import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';

interface Stats {
  totalRooms: number;
  availableRooms: number;
  totalFoodItems: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalRooms: 0, availableRooms: 0, totalFoodItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [roomsResponse, foodResponse] = await Promise.all([
        apiClient.get('/rooms?size=1000'),
        apiClient.get('/food-items?size=1000')
      ]);

      const rooms = roomsResponse.data.content || roomsResponse.data;
      const availableRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.available).length : 0;
      const foodItems = foodResponse.data.content || foodResponse.data;
      
      setStats({
        totalRooms: Array.isArray(rooms) ? rooms.length : 0,
        availableRooms,
        totalFoodItems: Array.isArray(foodItems) ? foodItems.length : 0
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const actionCards = [
    {
      title: 'Book a Room',
      description: 'Browse and book from our selection of premium rooms',
      icon: '🏨',
      gradient: 'from-primary to-purple-600',
      action: () => navigate('/home?tab=rooms')
    },
    {
      title: 'Order Food',
      description: 'Explore our delicious menu and place your order',
      icon: '🍽️',
      gradient: 'from-orange-500 to-red-600',
      action: () => navigate('/home?tab=food')
    },
    {
      title: 'My Bookings',
      description: 'View and manage your current and past bookings',
      icon: '📋',
      gradient: 'from-green-500 to-teal-600',
      action: () => navigate('/bookings')
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#003580] to-[#0056D6] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold mb-4 uppercase tracking-heading">
            Welcome to Hotel Paradise
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mb-8">
            Experience luxury and comfort. Book your perfect stay with us today.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="font-heading px-8 py-3 bg-[#F4B400] text-[#0B1220] rounded-lg font-bold hover:bg-[#D99A00] transition-all shadow-md hover:shadow-lg uppercase tracking-heading"
          >
            Explore Now →
          </button>
        </div>
      </section>

      {/* Stats Section */}
      {!loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Stat Card 1 */}
            <div className="bg-white border border-neutral-200 rounded-lg shadow-md p-6 flex items-center gap-4">
              <div className="text-3xl">🏨</div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Rooms</div>
                <div className="font-heading text-2xl font-bold text-[#0056D6]">{stats.totalRooms}</div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white border border-neutral-200 rounded-lg shadow-md p-6 flex items-center gap-4">
              <div className="text-3xl">✨</div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Available Now</div>
                <div className="font-heading text-2xl font-bold text-green-600">{stats.availableRooms}</div>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white border border-neutral-200 rounded-lg shadow-md p-6 flex items-center gap-4">
              <div className="text-3xl">🍽️</div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Menu Items</div>
                <div className="font-heading text-2xl font-bold text-orange-600">{stats.totalFoodItems}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Action Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-12 uppercase tracking-heading">
          What would you like to do?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, index) => (
            <div
              key={index}
              onClick={card.action}
              className="cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:scale-[1.02] p-6 flex flex-col h-full"
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-heading text-xl font-bold mb-2 uppercase tracking-heading flex-1">
                {card.title}
              </h3>
              <p className="text-sm text-blue-100 mb-6 flex-1">
                {card.description}
              </p>
              <button className="font-heading py-2 px-4 bg-[#F4B400] text-[#0B1220] rounded-lg font-bold hover:bg-[#D99A00] transition-all uppercase tracking-heading text-sm self-start">
                Get Started →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="font-heading text-4xl font-bold text-center text-gray-900 mb-12 uppercase tracking-heading">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-center max-w-5xl">
            <div className="text-center">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 uppercase">Premium Quality</h3>
              <p className="text-gray-600">Luxury accommodations with world-class amenities</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 uppercase">Instant Booking</h3>
              <p className="text-gray-600">Quick and easy reservation process</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 uppercase">Best Prices</h3>
              <p className="text-gray-600">Competitive rates with no hidden fees</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2 uppercase">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer assistance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
