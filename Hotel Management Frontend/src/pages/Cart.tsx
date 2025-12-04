import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import type { Room, FoodItem } from '../types';
import { Header } from '../components/Header';

interface CartState {
  roomQuantities: { [key: string]: number };
  selectedFood: { [key: number]: number };
  rooms: Room[];
  foodItems: FoodItem[];
  checkInDate: string;
  checkOutDate: string;
}

interface RoomTypeGroup {
  type: string;
  pricePerNight: number;
  availableCount: number;
  totalCount: number;
  availableRoomIds: number[];
}

const MAX_QUANTITY_PER_ITEM = 10;
const MAX_BOOKING_AMOUNT = 500000; // ₹5 lakhs

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartState = location.state as CartState;

  const [roomQuantities, setRoomQuantities] = useState<{ [key: string]: number }>(cartState?.roomQuantities || {});
  const [selectedFood, setSelectedFood] = useState<{ [key: number]: number }>(cartState?.selectedFood || {});
  const [bookingLoading, setBookingLoading] = useState(false);

  if (!cartState) {
    navigate('/home');
    return null;
  }

  const { rooms, foodItems, checkInDate, checkOutDate } = cartState;

  const handleBackToSelection = () => {
    if (!checkInDate || !checkOutDate || new Date(checkOutDate) <= new Date(checkInDate)) {
      navigate('/home');
    } else {
      navigate('/home', { state: { step: 'selection' } });
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

  const handleConfirmBooking = async () => {
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

    setBookingLoading(true);
    try {
      const allRoomIds: number[] = [];
      const roomGroups = groupRoomsByType();
      
      Object.entries(roomQuantities).forEach(([roomType, qty]) => {
        const group = roomGroups.find(g => g.type === roomType);
        if (group) {
          const idsToAdd = group.availableRoomIds.slice(0, qty);
          allRoomIds.push(...idsToAdd);
        }
      });

      const bookingData = {
        roomIds: allRoomIds,
        foodItems: Object.entries(selectedFood).map(([foodItemId, quantity]) => ({
          foodItemId: Number(foodItemId),
          quantity
        })),
        checkInDate,
        checkOutDate
      };

      await apiClient.post('/bookings', bookingData);
      toast.success('✨ Booking confirmed! Check your email for confirmation.');
      navigate('/bookings');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Booking failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedRoomGroups = groupRoomsByType().filter(group => roomQuantities[group.type] > 0);
  const selectedFoodItems = foodItems.filter(item => selectedFood[item.id] > 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
          <button
            onClick={handleBackToSelection}
            className="font-heading px-8 py-4 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-900 transition-all mb-6 inline-flex items-center gap-2 uppercase tracking-heading shadow-lg text-lg"
            aria-label="Back to Room Selection"
          >
            ← Back to Room Selection
          </button>
        </div>

        {/* Date Summary */}
        <div className="bg-gradient-to-r from-[#003580] to-[#0056D6] text-white p-6 rounded-xl mb-8 shadow-lg text-center max-w-4xl mx-auto">
          <p className="text-sm text-white/80 mb-1 uppercase tracking-wide">Your Stay</p>
          <p className="text-xl sm:text-2xl font-bold drop-shadow">
            {new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' → '}
            {new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            <span className="ml-3 text-[#F4B400]">({calculateNights()} night{calculateNights() !== 1 ? 's' : ''})</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Cart Items - left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rooms Section */}
            {selectedRoomGroups.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 uppercase tracking-heading flex items-center gap-2">
                  <span>🏨</span> Rooms
                </h2>
                <div className="space-y-4">
                  {selectedRoomGroups.map((group) => (
                    <div key={group.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-gray-900 uppercase">{group.type}</h3>
                        <p className="text-sm text-gray-600">₹{group.pricePerNight.toLocaleString('en-IN')} × {roomQuantities[group.type]} × {calculateNights()} nights</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white rounded-lg p-2">
                          <button
                            onClick={() => updateRoomQuantity(group.type, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-lg font-bold"
                          >
                            −
                          </button>
                          <span className="font-heading text-xl font-bold text-gray-900 min-w-[30px] text-center">
                            {roomQuantities[group.type]}
                          </span>
                          <button
                            onClick={() => updateRoomQuantity(group.type, 1)}
                            disabled={(roomQuantities[group.type] || 0) >= Math.min(group.availableCount, MAX_QUANTITY_PER_ITEM)}
                            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded hover:bg-secondary disabled:opacity-30 text-lg font-bold"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-heading text-xl font-bold text-primary min-w-[100px] text-right">
                          ₹{(group.pricePerNight * roomQuantities[group.type] * calculateNights()).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food Section */}
            {selectedFoodItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 uppercase tracking-heading flex items-center gap-2">
                  <span>🍽️</span> Food Items
                </h2>
                <div className="space-y-4">
                  {selectedFoodItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-bold text-gray-900 uppercase">{item.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{item.cuisine} • ₹{item.price.toLocaleString('en-IN')} each</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white rounded-lg p-2">
                          <button
                            onClick={() => updateFoodQuantity(item.id, (selectedFood[item.id] || 0) - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-lg font-bold"
                          >
                            −
                          </button>
                          <span className="font-heading text-xl font-bold text-gray-900 min-w-[30px] text-center">
                            {selectedFood[item.id]}
                          </span>
                          <button
                            onClick={() => updateFoodQuantity(item.id, (selectedFood[item.id] || 0) + 1)}
                            disabled={(selectedFood[item.id] || 0) >= MAX_QUANTITY_PER_ITEM}
                            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded hover:bg-secondary disabled:opacity-30 text-lg font-bold"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-heading text-xl font-bold text-primary min-w-[100px] text-right">
                          ₹{(item.price * selectedFood[item.id]).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRoomGroups.length === 0 && selectedFoodItems.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2 uppercase">Cart is Empty</h2>
                <p className="text-gray-600 mb-6">Add some rooms or food items to continue</p>
                <button
                  onClick={() => navigate('/home')}
                  className="font-heading px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary uppercase tracking-heading"
                >
                  Browse Items
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 w-full">
            {/* Desktop: Sticky sidebar */}
            <div className="hidden lg:block sticky top-20 bg-white border border-neutral-200 rounded-xl shadow-lg p-6">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 uppercase tracking-heading text-center">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Rooms ({Object.values(roomQuantities).reduce((a, b) => a + b, 0)})</span>
                  <span className="font-semibold">
                    ₹{Object.entries(roomQuantities).reduce((sum, [roomType, qty]) => {
                      const roomGroup = groupRoomsByType().find(g => g.type === roomType);
                      return sum + (roomGroup?.pricePerNight || 0) * qty * calculateNights();
                    }, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Food ({Object.keys(selectedFood).length} items)</span>
                  <span className="font-semibold">
                    ₹{Object.entries(selectedFood).reduce((sum, [foodId, qty]) => {
                      const item = foodItems.find(f => f.id === Number(foodId));
                      return sum + (item?.price || 0) * qty;
                    }, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-xl font-bold text-gray-900 uppercase">Total</span>
                    <span className="font-heading text-3xl font-bold text-primary">
                      ₹{calculateTotal().toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">for {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading || Object.keys(roomQuantities).length === 0}
                className="w-full font-heading py-4 bg-[#F4B400] text-[#0B1220] rounded-xl font-bold text-lg hover:bg-[#D99A00] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-heading shadow-xl hover:shadow-2xl transition-all"
              >
                {bookingLoading ? 'Processing...' : '✨ Confirm Booking'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By confirming, you agree to our terms and conditions
              </p>
            </div>

            {/* Mobile/Tablet: Summary below items */}
            <div className="lg:hidden bg-white border border-neutral-200 rounded-xl shadow-lg p-6">
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 uppercase tracking-heading text-center">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Rooms ({Object.values(roomQuantities).reduce((a, b) => a + b, 0)})</span>
                  <span className="font-semibold">
                    ₹{Object.entries(roomQuantities).reduce((sum, [roomType, qty]) => {
                      const roomGroup = groupRoomsByType().find(g => g.type === roomType);
                      return sum + (roomGroup?.pricePerNight || 0) * qty * calculateNights();
                    }, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Food ({Object.keys(selectedFood).length} items)</span>
                  <span className="font-semibold">
                    ₹{Object.entries(selectedFood).reduce((sum, [foodId, qty]) => {
                      const item = foodItems.find(f => f.id === Number(foodId));
                      return sum + (item?.price || 0) * qty;
                    }, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-xl font-bold text-gray-900 uppercase">Total</span>
                    <span className="font-heading text-3xl font-bold text-primary">
                      ₹{calculateTotal().toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">for {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading || Object.keys(roomQuantities).length === 0}
                className="w-full font-heading py-4 bg-[#F4B400] text-[#0B1220] rounded-xl font-bold text-lg hover:bg-[#D99A00] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-heading shadow-xl hover:shadow-2xl transition-all"
              >
                {bookingLoading ? 'Processing...' : '✨ Confirm Booking'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By confirming, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
