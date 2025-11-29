export interface User {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface Room {
  id: number;
  roomNumber: number;
  roomType: string;
  pricePerNight: number;
  available: boolean;
}

export interface FoodItem {
  id: number;
  name: string;
  cuisine: string;
  price: number;
  imageUrl?: string;
}

export interface CartItem {
  foodItemId: number;
  quantity: number;
}

export interface Cart {
  roomIds: number[];
  foodItems: CartItem[];
  totalAmount: number;
}

export interface Booking {
  id: number;
  roomIds: number[];
  foodItems: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
