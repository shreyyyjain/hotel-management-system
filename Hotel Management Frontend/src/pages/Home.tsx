import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import type { Room, FoodItem } from '../types';
import { authService } from '../services/authService';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { Header } from '../components/Header';

interface RoomTypeGroup {
  type: string;
  pricePerNight: number;
  availableCount: number;
  totalCount: number;
  availableRoomIds: number[];
}

const MAX_QUANTITY_PER_ITEM = 10;
const MAX_BOOKING_AMOUNT = 500000; // ₹5 lakhs

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [roomQuantities, setRoomQuantities] = useState<{ [key: string]: number }>({});
  const [selectedFood, setSelectedFood] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'rooms' | 'food'>('rooms');
  const [bookingStep, setBookingStep] = useState<'dates' | 'selection'>(
    location.state?.step === 'selection' ? 'selection' : 'dates'
  );
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, foodRes] = await Promise.all([
        apiClient.get('/rooms?size=100'),
        apiClient.get('/food-items?size=100')
      ]);
      setRooms(roomsRes.data.content || roomsRes.data);
      setFoodItems(foodRes.data.content || foodRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const groupRoomsByType = (): RoomTypeGroup[] => {
    const grouped = rooms.reduce((acc, room) => {
      if (!acc[room.roomType]) {
        acc[room.roomType] = {
          type: room.roomType,
          pricePerNight: room.pricePerNight,
          availableCount: 0,
          totalCount: 0,
          availableRoomIds: []
        };
      }
      acc[room.roomType].totalCount++;
      if (room.available) {
        acc[room.roomType].availableCount++;
        acc[room.roomType].availableRoomIds.push(room.id);
      }
      return acc;
    }, {} as Record<string, RoomTypeGroup>);

    return Object.values(grouped);
  };

  const updateRoomQuantity = (roomType: string, delta: number) => {
    const current = roomQuantities[roomType] || 0;
    const roomGroup = groupRoomsByType().find(g => g.type === roomType);
    const available = roomGroup?.availableCount || 0;
    const newQty = Math.max(0, Math.min(available, Math.min(MAX_QUANTITY_PER_ITEM, current + delta)));
    
    if (delta > 0 && newQty >= available) {
      toast.error(`Only ${available} ${roomType} rooms available`);
    }
    
    if (delta > 0 && newQty >= MAX_QUANTITY_PER_ITEM) {
      toast.error(`Maximum ${MAX_QUANTITY_PER_ITEM} rooms per type allowed`);
    }
    
    if (newQty === 0) {
      const { [roomType]: _, ...rest } = roomQuantities;
      setRoomQuantities(rest);
    } else {
      setRoomQuantities({ ...roomQuantities, [roomType]: newQty });
    }
  };

  const updateFoodQuantity = (foodId: number, quantity: number) => {
    const newQty = Math.max(0, Math.min(MAX_QUANTITY_PER_ITEM, quantity));
    
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      toast.error(`Maximum ${MAX_QUANTITY_PER_ITEM} items allowed`);
    }
    
    if (newQty <= 0) {
      const newFood = { ...selectedFood };
      delete newFood[foodId];
      setSelectedFood(newFood);
    } else {
      setSelectedFood({ ...selectedFood, [foodId]: newQty });
    }
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights() || 1;
    const roomTotal = Object.entries(roomQuantities).reduce((sum, [roomType, qty]) => {
      const roomGroup = groupRoomsByType().find(g => g.type === roomType);
      return sum + (roomGroup?.pricePerNight || 0) * qty * nights;
    }, 0);

    const foodTotal = Object.entries(selectedFood).reduce((sum, [foodId, qty]) => {
      const item = foodItems.find(f => f.id === Number(foodId));
      return sum + (item?.price || 0) * qty;
    }, 0);

    return roomTotal + foodTotal;
  };

  const handleContinueToSelection = () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      toast.error('Check-in date cannot be in the past');
      return;
    }

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setBookingStep('selection');
  };

  const handleGoToCart = () => {
    const selectedRoomCount = Object.values(roomQuantities).reduce((a, b) => a + b, 0);
    
    if (selectedRoomCount === 0) {
      toast.error('Please select at least one room');
      return;
    }

    const total = calculateTotal();
    if (total > MAX_BOOKING_AMOUNT) {
      toast.error(`Booking amount exceeds maximum limit of ₹${MAX_BOOKING_AMOUNT.toLocaleString('en-IN')}`);
      return;
    }

    // Navigate to cart with state
    navigate('/cart', {
      state: {
        roomQuantities,
        selectedFood,
        rooms,
        foodItems,
        checkInDate,
        checkOutDate
      }
    });
  };



  const filteredRoomGroups = groupRoomsByType().filter(group => {
    const matchesSearch = group.type.toLowerCase().includes(roomSearch.toLowerCase());
    const matchesType = !roomTypeFilter || group.type === roomTypeFilter;
    return matchesSearch && matchesType && group.availableCount > 0;
  });

  const filteredFood = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(foodSearch.toLowerCase());
    const matchesCuisine = !cuisineFilter || item.cuisine.toLowerCase() === cuisineFilter.toLowerCase();
    return matchesSearch && matchesCuisine;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SkeletonGrid count={6} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-8 flex flex-col items-center justify-center">
        {/* Date Selection Step */}
        {bookingStep === 'dates' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 sm:p-12 rounded-2xl shadow-2xl mb-8 w-full">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-center uppercase tracking-heading text-white">
                When do you want to stay?
              </h2>
              <p className="text-center text-lg sm:text-xl mb-8 text-gray-200">
                Select your check-in and check-out dates to see available rooms
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="checkInDate" className="block text-sm font-bold mb-2 text-gray-100 uppercase tracking-wide">
                    📅 Check-in Date
                  </label>
                  <input
                    id="checkInDate"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-xl text-gray-900 font-semibold focus:outline-none focus:ring-4 focus:ring-[#F4B400] transition-all bg-white"
                    aria-label="Select check-in date"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="checkOutDate" className="block text-sm font-bold mb-2 text-gray-100 uppercase tracking-wide">
                    📅 Check-out Date
                  </label>
                  <input
                    id="checkOutDate"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-xl text-gray-900 font-semibold focus:outline-none focus:ring-4 focus:ring-[#F4B400] transition-all bg-white"
                    aria-label="Select check-out date"
                    aria-required="true"
                  />
                </div>
              </div>
              <button
                onClick={handleContinueToSelection}
                disabled={!checkInDate || !checkOutDate || new Date(checkOutDate) <= new Date(checkInDate)}
                className="mt-8 w-full py-4 sm:py-6 bg-[#F4B400] text-[#0B1220] text-xl sm:text-2xl font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D99A00] transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] uppercase tracking-heading"
                aria-label="Continue to room selection"
              >
                Continue to Room Selection →
              </button>
            </div>
          </div>
        )}

        {/* Room & Food Selection Step */}
        {bookingStep === 'selection' && (
          <div className="w-full flex flex-col items-center">
            {/* Date Summary Banner */}
            <div className="bg-gradient-to-r from-[#003580] to-[#0056D6] text-white p-4 sm:p-6 rounded-xl mb-8 shadow-lg max-w-5xl w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-white/80 mb-1 uppercase tracking-wide">Your Stay</p>
                  <p className="text-lg sm:text-xl font-bold drop-shadow">
                    {new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' → '}
                    {new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="ml-3 text-accent">({calculateNights()} night{calculateNights() !== 1 ? 's' : ''})</span>
                  </p>
                </div>
                <button
                  onClick={() => setBookingStep('dates')}
                  className="font-heading px-6 py-3 bg-gray-700 text-white rounded-lg font-bold uppercase tracking-heading transition-all hover:bg-gray-600 shadow-md"
                  aria-label="Change dates"
                >
                  Change Dates
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 sm:gap-4 border-b-2 border-gray-200 mb-8 justify-center max-w-5xl w-full">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`font-heading px-4 sm:px-8 py-3 sm:py-4 font-bold uppercase tracking-heading transition-all text-sm sm:text-base ${
                  activeTab === 'rooms'
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="View rooms tab"
                aria-pressed={activeTab === 'rooms'}
              >
                🏨 Rooms
              </button>
              <button
                onClick={() => setActiveTab('food')}
                className={`font-heading px-4 sm:px-8 py-3 sm:py-4 font-bold uppercase tracking-heading transition-all text-sm sm:text-base ${
                  activeTab === 'food'
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="View food menu tab"
                aria-pressed={activeTab === 'food'}
              >
                🍽️ Food Menu
              </button>
            </div>

            {/* Rooms Section */}
            {activeTab === 'rooms' && (
              <section className="mb-12 max-w-7xl w-full flex flex-col items-center" aria-labelledby="rooms-heading">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 w-full">
                  <h2 id="rooms-heading" className="font-heading text-heading-md font-bold text-gray-900 uppercase tracking-heading">
                    Select Your Rooms
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                    <input
                      type="text"
                      placeholder="Search room types..."
                      value={roomSearch}
                      onChange={(e) => setRoomSearch(e.target.value)}
                      className="px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      aria-label="Search room types"
                    />
                    <select 
                      value={roomTypeFilter}
                      onChange={(e) => setRoomTypeFilter(e.target.value)}
                      className="px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      aria-label="Filter by room type"
                    >
                      <option value="">All Types</option>
                      <option value="SINGLE">Single</option>
                      <option value="DOUBLE">Double</option>
                      <option value="DELUXE">Deluxe</option>
                      <option value="SUITE">Suite</option>
                      <option value="PRESIDENTIAL">Presidential</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center w-full max-w-6xl">
                  {filteredRoomGroups.map((group) => (
                    <div
                      key={group.type}
                      className="bg-white border border-neutral-200 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02] w-full max-w-xs flex flex-col h-full"
                    >
                      <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-7xl" role="img" aria-label="Hotel icon">🏨</span>
                      </div>
                      <div className="p-6 sm:p-8 flex flex-col flex-1">
                        {/* Title and Price */}
                        <div className="flex items-start justify-between w-full mb-4">
                          <h3 className="font-heading text-xl font-bold text-gray-900 uppercase tracking-heading flex-1">
                            {group.type}
                          </h3>
                          <div className="text-right">
                            <div className="font-heading text-2xl font-bold text-primary">
                              ₹{group.pricePerNight.toLocaleString('en-IN')}
                            </div>
                            <span className="text-xs text-gray-500 uppercase">per night</span>
                          </div>
                        </div>

                        {/* Availability */}
                        <p className="text-sm text-gray-600 mb-6">
                          <strong className="text-green-600">{group.availableCount}</strong> available of {group.totalCount}
                        </p>
                        
                        {/* Quantity Selector - pinned to bottom */}
                        <div className="mt-auto flex items-center justify-end gap-3 bg-gray-50 rounded-lg p-4">
                          <button
                            onClick={() => updateRoomQuantity(group.type, -1)}
                            disabled={!roomQuantities[group.type]}
                            className="font-heading w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold transition-all active:scale-95"
                            aria-label={`Decrease ${group.type} room quantity`}
                          >
                            −
                          </button>
                          <div className="text-center min-w-[50px]">
                            <div className="font-heading text-xl font-bold text-gray-900">
                              {roomQuantities[group.type] || 0}
                            </div>
                          </div>
                          <button
                            onClick={() => updateRoomQuantity(group.type, 1)}
                            disabled={!group.availableCount || (roomQuantities[group.type] || 0) >= Math.min(group.availableCount, MAX_QUANTITY_PER_ITEM)}
                            className="font-heading w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold transition-all active:scale-95 shadow-md hover:shadow-lg"
                            aria-label={`Increase ${group.type} room quantity`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Food Items Section */}
            {activeTab === 'food' && (
              <section className="mb-12 max-w-7xl w-full flex flex-col items-center" aria-labelledby="food-heading">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 w-full">
                  <h2 id="food-heading" className="font-heading text-heading-md font-bold text-gray-900 uppercase tracking-heading">
                    Add Food to Your Order
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                    <input
                      type="text"
                      placeholder="Search food..."
                      value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      className="px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      aria-label="Search food items"
                    />
                    <select 
                      value={cuisineFilter}
                      onChange={(e) => setCuisineFilter(e.target.value)}
                      className="px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      aria-label="Filter by cuisine"
                    >
                      <option value="">All Cuisines</option>
                      <option value="indian">Indian</option>
                      <option value="chinese">Chinese</option>
                      <option value="italian">Italian</option>
                      <option value="mexican">Mexican</option>
                      <option value="continental">Continental</option>
                      <option value="thai">Thai</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center w-full max-w-6xl">
                  {filteredFood.map((item) => (
                    <div key={item.id} className="bg-white border border-neutral-200 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02] w-full max-w-xs flex flex-col h-full">
                      <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                        <span className="text-7xl" role="img" aria-label="Food icon">🍽️</span>
                      </div>
                      <div className="p-6 sm:p-8 flex flex-col flex-1">
                        {/* Title and Price */}
                        <div className="flex items-start justify-between w-full mb-2">
                          <h3 className="font-heading text-lg font-bold text-gray-900 uppercase tracking-heading flex-1">
                            {item.name}
                          </h3>
                          <div className="text-right">
                            <div className="font-heading text-xl font-bold text-primary">
                              ₹{item.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Cuisine Type */}
                        <p className="text-sm text-gray-600 mb-6 capitalize">{item.cuisine} Cuisine</p>
                        
                        {/* Quantity Selector - pinned to bottom */}
                        <div className="mt-auto flex items-center justify-end gap-3 bg-gray-50 rounded-lg p-4">
                          <button
                            onClick={() => updateFoodQuantity(item.id, (selectedFood[item.id] || 0) - 1)}
                            disabled={!selectedFood[item.id]}
                            className="font-heading w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold transition-all active:scale-95"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            −
                          </button>
                          <div className="text-center min-w-[50px]">
                            <div className="font-heading text-xl font-bold text-gray-900">
                              {selectedFood[item.id] || 0}
                            </div>
                          </div>
                          <button
                            onClick={() => updateFoodQuantity(item.id, (selectedFood[item.id] || 0) + 1)}
                            disabled={(selectedFood[item.id] || 0) >= MAX_QUANTITY_PER_ITEM}
                            className="font-heading w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold transition-all active:scale-95 shadow-md hover:shadow-lg"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Booking Summary - Desktop (lg and up) */}
        {bookingStep === 'selection' && (Object.keys(roomQuantities).length > 0 || Object.keys(selectedFood).length > 0) && (
          <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#003580] to-[#0056D6] border-t-4 border-[#F4B400] shadow-2xl z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-100">
                  {Object.values(roomQuantities).reduce((a, b) => a + b, 0)} room(s) · {Object.keys(selectedFood).length} food item(s)
                </div>
                <div className="font-heading text-2xl font-bold text-[#F4B400]">
                  ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <button
                  onClick={handleGoToCart}
                  disabled={Object.keys(roomQuantities).length === 0}
                  className="font-heading px-8 py-3 bg-[#F4B400] text-[#0B1220] rounded-lg font-bold text-base hover:bg-[#D99A00] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-heading shadow-md hover:shadow-lg transition-all"
                  aria-label="Go to cart"
                >
                  🛒 Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Summary - Mobile & Tablet (below lg) */}
        {bookingStep === 'selection' && (Object.keys(roomQuantities).length > 0 || Object.keys(selectedFood).length > 0) && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#003580] to-[#0056D6] border-t-4 border-[#F4B400] shadow-2xl z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-blue-100 mb-1">Total for {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</p>
                  <p className="font-heading text-xl sm:text-2xl font-bold text-white">
                    ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={handleGoToCart}
                  disabled={Object.keys(roomQuantities).length === 0}
                  className="font-heading px-4 sm:px-6 py-3 sm:py-4 bg-[#F4B400] text-[#0B1220] rounded-lg font-bold text-sm sm:text-base hover:bg-[#D99A00] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-heading shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                  aria-label="Go to cart"
                >
                  🛒 Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
