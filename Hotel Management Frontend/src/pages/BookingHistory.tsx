import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

interface Room {
  id: number;
  roomNumber: number;
  roomType: string;
  pricePerNight: number;
}

interface FoodItem {
  id: number;
  name: string;
  price: number;
  cuisine: string;
}

interface Booking {
  id: number;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  rooms: Room[];
  foodItems: FoodItem[];
  foodQuantities: string;
  totalAmount: number;
  checkInDate?: string;
  checkOutDate?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await apiClient.get('/bookings/my-history');
      setBookings(response.data.content || response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await apiClient.put(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
      toast.success('Booking cancelled successfully');
      loadBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONFIRMED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 pb-36 flex justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="font-heading px-8 py-4 bg-[#0056D6] text-white rounded-xl font-bold hover:bg-[#0046B1] transition-all mb-8 flex items-center gap-2 uppercase tracking-heading shadow-lg text-lg"
            aria-label="Back to Dashboard"
          >
            ← Dashboard
          </button>
          <h1 className="font-heading text-4xl font-bold text-neutral-900 uppercase tracking-heading text-center">
            My Bookings
          </h1>
          <p className="text-gray-600 mt-2 text-center">View and manage all your reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-6">📋</div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4 uppercase">
              No Bookings Yet
            </h2>
            <p className="text-gray-600 mb-8">
              Start your journey by booking a room or ordering food
            </p>
            <button
              onClick={() => navigate('/home')}
              className="font-heading px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-all uppercase tracking-heading"
            >
              Explore Now
            </button>
          </div>
        ) : (
          <div className="space-y-8 flex flex-col items-center">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all w-full max-w-3xl"
              >
                <div className="p-8">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading text-2xl font-bold text-gray-900">
                          Booking #{booking.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)} uppercase`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="font-heading text-3xl font-bold text-primary">
                        ₹{(booking.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Check-in</p>
                      <p className="font-heading text-lg font-bold text-gray-900">
                        {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Check-out</p>
                      <p className="font-heading text-lg font-bold text-gray-900">
                        {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Duration</p>
                      <p className="font-heading text-lg font-bold text-gray-900">
                        {booking.checkInDate && booking.checkOutDate 
                          ? (() => {
                              const nights = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
                              return nights === 1 ? '1 night' : `${nights} nights`;
                            })()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Room & Food Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-primary mb-2">🏨 Rooms</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.rooms?.map((room) => (
                          <span key={room.id} className="px-3 py-1 bg-white text-secondary rounded-full text-sm font-medium">
                            Room {room.roomNumber} ({room.roomType})
                          </span>
                        )) || <span className="text-gray-500 italic">No rooms</span>}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm font-semibold text-orange-900 mb-2">🍽️ Food Items</p>
                      <div className="text-sm text-orange-700">
                        {booking.foodItems && booking.foodItems.length > 0 ? (
                          booking.foodItems.map((item) => {
                            let qty = 1;
                            try {
                              const quantities = booking.foodQuantities ? JSON.parse(booking.foodQuantities) : {};
                              qty = quantities[item.id] || 1;
                            } catch (e) {
                              // Fallback to 1
                            }
                            return (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-semibold">× {qty}</span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-gray-500 italic">No food items</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => toast('View details feature coming soon!', { icon: 'ℹ️' })}
                      className="font-heading px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-secondary transition-all uppercase tracking-heading"
                    >
                      View Details
                    </button>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="font-heading px-6 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all uppercase tracking-heading"
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === 'COMPLETED' && (
                      <button
                        onClick={() => navigate('/home')}
                        className="font-heading px-6 py-3 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-all uppercase tracking-heading"
                      >
                        Book Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
