import apiClient from './apiClient';
import type { Room, FoodItem, Cart } from '../types';

export const roomsService = {
  getAllRooms: async (): Promise<Room[]> => {
    const response = await apiClient.get('/rooms');
    return response.data;
  },

  getRoomById: async (id: number): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
  },

  bookRoom: async (roomId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/rooms/${roomId}/book`);
    return response.data;
  },

  getAllFood: async (): Promise<FoodItem[]> => {
    const response = await apiClient.get('/food');
    return response.data;
  },

  getFoodByCuisine: async (cuisine: string): Promise<FoodItem[]> => {
    const response = await apiClient.get(`/food/cuisine/${cuisine}`);
    return response.data;
  },

  getCuisines: async (): Promise<string[]> => {
    const response = await apiClient.get('/food/cuisines');
    return response.data;
  },
};

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  addRoomToCart: async (roomId: number): Promise<Cart> => {
    const response = await apiClient.post('/cart/rooms', { roomId });
    return response.data;
  },

  addFoodToCart: async (foodItemId: number, quantity: number): Promise<Cart> => {
    const response = await apiClient.post('/cart/food', { foodItemId, quantity });
    return response.data;
  },

  removeFromCart: async (itemId: number, itemType: 'room' | 'food'): Promise<Cart> => {
    const response = await apiClient.delete(`/cart/${itemType}/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },

  checkout: async (): Promise<{ bookingId: number; total: number }> => {
    const response = await apiClient.post('/cart/checkout');
    return response.data;
  },
};
