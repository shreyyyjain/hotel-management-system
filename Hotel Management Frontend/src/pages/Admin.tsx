import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

interface Room {
  id: number;
  roomNumber: number;
  roomType: string;
  pricePerNight: number;
  available: boolean;
}

interface FoodItem {
  id: number;
  name: string;
  cuisine: string;
  price: number;
}

interface Booking {
  id: number;
  user: User;
  rooms: Room[];
  foodItems: FoodItem[];
  totalAmount: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  totalFoodItems: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'rooms' | 'food' | 'bookings' | 'add-food' | 'edit-prices'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Food creation form state
  const [newFood, setNewFood] = useState({ name: '', cuisine: '', price: 0 });
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  
  // Room price editing state
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editRoomPrice, setEditRoomPrice] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, roomsRes, foodRes, bookingsRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/rooms'),
        apiClient.get('/admin/food-items'),
        apiClient.get('/admin/bookings')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setRooms(roomsRes.data);
      setFoodItems(foodRes.data);
      setBookings(bookingsRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load admin data');
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomAvailability = async (roomId: number, currentStatus: boolean) => {
    try {
      await apiClient.put(`/admin/rooms/${roomId}/availability?available=${!currentStatus}`);
      toast.success('Room availability updated');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update room');
    }
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      await apiClient.put(`/admin/bookings/${bookingId}/status?status=${newStatus}`);
      toast.success('Booking status updated');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const createFoodItem = async () => {
    if (!newFood.name || !newFood.cuisine || newFood.price <= 0) {
      toast.error('Please fill all fields with valid values');
      return;
    }
    try {
      await apiClient.post('/admin/food-items', newFood);
      toast.success('Food item created successfully');
      setNewFood({ name: '', cuisine: '', price: 0 });
      setActiveTab('food');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create food item');
    }
  };

  const updateFoodItem = async () => {
    if (!editingFood) return;
    try {
      await apiClient.put(`/admin/food-items/${editingFood.id}`, editingFood);
      toast.success('Food item updated successfully');
      setEditingFood(null);
      setActiveTab('food');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update food item');
    }
  };

  const updateRoomPrice = async (roomId: number) => {
    if (!editingRoom || editRoomPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    try {
      await apiClient.put(`/admin/rooms/${roomId}/price`, { pricePerNight: editRoomPrice });
      toast.success('Room price updated successfully');
      setEditingRoom(null);
      setEditRoomPrice(0);
      setActiveTab('rooms');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update room price');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure? This will delete the user and all their bookings.')) return;
    
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const deleteRoom = async (roomId: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await apiClient.delete(`/admin/rooms/${roomId}`);
      toast.success('Room deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const deleteFoodItem = async (foodId: number) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    
    try {
      await apiClient.delete(`/admin/food-items/${foodId}`);
      toast.success('Food item deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete food item');
    }
  };

  const deleteBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      await apiClient.delete(`/admin/bookings/${bookingId}`);
      toast.success('Booking deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-2xl font-heading text-gray-600">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="font-heading text-4xl font-bold text-gray-900 uppercase tracking-heading">
                🔧 Admin Dashboard
              </h1>
              <button
                onClick={() => navigate('/dashboard')}
                className="font-heading px-6 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition-all uppercase tracking-heading"
              >
                ← Back to Dashboard
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b-2 border-gray-200 overflow-x-auto pb-2">
              {(['stats', 'users', 'rooms', 'add-food', 'edit-prices', 'bookings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-heading font-bold uppercase tracking-heading transition-all whitespace-nowrap text-sm ${
                    activeTab === tab
                      ? 'text-primary border-b-4 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'stats' && '📊 Stats'}
                  {tab === 'users' && '👥 Users'}
                  {tab === 'rooms' && '🏨 Rooms'}
                  {tab === 'add-food' && '➕ Add Food'}
                  {tab === 'edit-prices' && '💰 Edit Prices'}
                  {tab === 'bookings' && '📋 Bookings'}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                  <p className="text-sm uppercase tracking-wide mb-2">Total Users</p>
                  <p className="text-4xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg">
                  <p className="text-sm uppercase tracking-wide mb-2">Total Bookings</p>
                  <p className="text-4xl font-bold">{stats.totalBookings}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-lg">
                  <p className="text-sm uppercase tracking-wide mb-2">Total Rooms</p>
                  <p className="text-4xl font-bold">{stats.totalRooms}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-xl shadow-lg">
                  <p className="text-sm uppercase tracking-wide mb-2">Total Revenue</p>
                  <p className="text-4xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              {/* Room Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="font-heading text-2xl font-bold mb-6 uppercase">Room Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-500 mb-2">Available Rooms</p>
                    <p className="text-3xl font-bold text-green-600">{stats.availableRooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Booked Rooms</p>
                    <p className="text-3xl font-bold text-red-600">{stats.bookedRooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Occupancy Rate</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {((stats.bookedRooms / stats.totalRooms) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="font-heading text-2xl font-bold mb-6 uppercase">Booking Statistics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-gray-500 mb-2">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Confirmed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Cancelled</p>
                    <p className="text-3xl font-bold text-red-600">{stats.cancelledBookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Completed</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.completedBookings}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-heading text-2xl font-bold uppercase">All Users ({users.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">ID</th>
                      <th className="text-left p-4 font-semibold">Email</th>
                      <th className="text-left p-4 font-semibold">Full Name</th>
                      <th className="text-left p-4 font-semibold">Created At</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{user.id}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.fullName}</td>
                        <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-heading text-2xl font-bold uppercase">All Rooms ({rooms.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">ID</th>
                      <th className="text-left p-4 font-semibold">Room Number</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Price/Night</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{room.id}</td>
                        <td className="p-4">{room.roomNumber}</td>
                        <td className="p-4">{room.roomType}</td>
                        <td className="p-4">₹{room.pricePerNight.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {room.available ? 'Available' : 'Booked'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleRoomAvailability(room.id, room.available)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                            >
                              Toggle
                            </button>
                            <button
                              onClick={() => deleteRoom(room.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Food Items Tab */}
          {activeTab === 'food' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-heading text-2xl font-bold uppercase">All Food Items ({foodItems.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">ID</th>
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Cuisine</th>
                      <th className="text-left p-4 font-semibold">Price</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{item.id}</td>
                        <td className="p-4">{item.name}</td>
                        <td className="p-4 capitalize">{item.cuisine}</td>
                        <td className="p-4">₹{item.price.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <button
                            onClick={() => deleteFoodItem(item.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-heading text-2xl font-bold uppercase">All Bookings ({bookings.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">ID</th>
                      <th className="text-left p-4 font-semibold">User</th>
                      <th className="text-left p-4 font-semibold">Check-in</th>
                      <th className="text-left p-4 font-semibold">Check-out</th>
                      <th className="text-left p-4 font-semibold">Total</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{booking.id}</td>
                        <td className="p-4">{booking.user?.email || 'N/A'}</td>
                        <td className="p-4">{booking.checkInDate || 'N/A'}</td>
                        <td className="p-4">{booking.checkOutDate || 'N/A'}</td>
                        <td className="p-4">₹{booking.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="px-3 py-1 rounded-lg border-2 border-gray-300 focus:border-primary focus:outline-none text-sm font-semibold"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Food Item Tab */}
          {activeTab === 'add-food' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-heading text-2xl font-bold uppercase">Add/Edit Food Item</h2>
              </div>
              <div className="p-6">
                {!editingFood ? (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Create New Food Item</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Food Name</label>
                        <input
                          type="text"
                          value={newFood.name}
                          onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                          placeholder="e.g., Pasta Carbonara"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Cuisine Type</label>
                        <input
                          type="text"
                          value={newFood.cuisine}
                          onChange={(e) => setNewFood({ ...newFood, cuisine: e.target.value })}
                          placeholder="e.g., Italian"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Price (₹)</label>
                        <input
                          type="number"
                          value={newFood.price}
                          onChange={(e) => setNewFood({ ...newFood, price: parseFloat(e.target.value) })}
                          placeholder="e.g., 350"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={createFoodItem}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
                      >
                        ✓ Create Food Item
                      </button>
                    </div>

                    <hr className="my-8" />

                    <div>
                      <h3 className="text-xl font-bold mb-4">Existing Food Items (Click to Edit)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {foodItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setEditingFood(item)}
                            className="p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all"
                          >
                            <h4 className="font-bold text-lg">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.cuisine}</p>
                            <p className="text-green-600 font-bold text-lg mt-2">₹{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Edit Food Item: {editingFood.name}</h3>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Food Name</label>
                      <input
                        type="text"
                        value={editingFood.name}
                        onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Cuisine Type</label>
                      <input
                        type="text"
                        value={editingFood.cuisine}
                        onChange={(e) => setEditingFood({ ...editingFood, cuisine: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={editingFood.price}
                        onChange={(e) => setEditingFood({ ...editingFood, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={updateFoodItem}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                      >
                        ✓ Save Changes
                      </button>
                      <button
                        onClick={() => setEditingFood(null)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Room Prices Tab */}
          {activeTab === 'edit-prices' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-heading text-2xl font-bold uppercase">Edit Room Prices</h2>
              </div>
              <div className="p-6">
                {!editingRoom ? (
                  <div>
                    <p className="text-gray-600 mb-6">Click on any room to edit its nightly price</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => {
                            setEditingRoom(room);
                            setEditRoomPrice(room.pricePerNight);
                          }}
                          className="p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-500 transition-all"
                        >
                          <h4 className="font-bold text-lg">Room {room.roomNumber}</h4>
                          <p className="text-sm text-gray-600">{room.roomType}</p>
                          <p className="text-green-600 font-bold text-xl mt-2">₹{room.pricePerNight.toLocaleString('en-IN')}/night</p>
                          <p className="text-sm mt-2">{room.available ? '✓ Available' : '✕ Booked'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md">
                    <h3 className="text-xl font-bold mb-4">Edit Price for Room {editingRoom.roomNumber}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Room Type</label>
                        <p className="px-4 py-2 bg-gray-100 rounded-lg">{editingRoom.roomType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Current Price per Night</label>
                        <p className="px-4 py-2 text-xl font-bold text-green-600">₹{editingRoom.pricePerNight.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">New Price per Night (₹)</label>
                        <input
                          type="number"
                          value={editRoomPrice}
                          onChange={(e) => setEditRoomPrice(parseFloat(e.target.value))}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none text-lg"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => updateRoomPrice(editingRoom.id)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                        >
                          ✓ Update Price
                        </button>
                        <button
                          onClick={() => {
                            setEditingRoom(null);
                            setEditRoomPrice(0);
                          }}
                          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
