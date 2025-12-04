import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 uppercase tracking-heading">
              Welcome to Hotel Paradise
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 mb-8 max-w-3xl mx-auto font-body">
              Experience luxury and comfort like never before. Book your perfect stay with us today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/home')}
                className="font-heading px-10 py-4 bg-accent text-gray-900 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl uppercase tracking-heading"
              >
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {!loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">🏨</div>
              <div className="font-heading text-4xl font-bold text-primary mb-2">{stats.totalRooms}</div>
              <div className="text-gray-600 font-medium">Total Rooms</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">✨</div>
              <div className="font-heading text-4xl font-bold text-green-600 mb-2">{stats.availableRooms}</div>
              <div className="text-gray-600 font-medium">Available Now</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">🍽️</div>
              <div className="font-heading text-4xl font-bold text-orange-600 mb-2">{stats.totalFoodItems}</div>
              <div className="text-gray-600 font-medium">Menu Items</div>
            </div>
          </div>
        </section>
      )}

      {/* Action Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center">
        <h2 className="font-heading text-4xl font-bold text-center text-gray-900 mb-16 uppercase tracking-heading">
          What would you like to do?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center max-w-5xl">
          {actionCards.map((card, index) => (
            <div
              key={index}
              onClick={card.action}
              className="group cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              <div className={`h-3 bg-gradient-to-r ${card.gradient}`}></div>
              <div className="p-8">
                <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4 text-center uppercase tracking-heading">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {card.description}
                </p>
                <button className="w-full font-heading py-3 bg-primary text-white rounded-lg font-bold hover:bg-secondary transition-all uppercase tracking-heading">
                  Get Started →
                </button>
              </div>
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
