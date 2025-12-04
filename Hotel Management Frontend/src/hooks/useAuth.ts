import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import type { AuthResponse } from '../types';

export function useAuth() {
  const { state, dispatch } = useAppContext();

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response: AuthResponse = await authService.login(email, password);
      const user = { id: response.id, email: response.email, fullName: response.fullName, createdAt: new Date().toISOString() };
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: response.accessToken });
      dispatch({ type: 'SET_ERROR', payload: null });
      return response;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response: AuthResponse = await authService.signup(email, password, fullName);
      const user = { id: response.id, email: response.email, fullName: response.fullName, createdAt: new Date().toISOString() };
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: response.accessToken });
      dispatch({ type: 'SET_ERROR', payload: null });
      return response;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return {
    user: state.auth.user,
    token: state.auth.token,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    error: state.auth.error,
    login,
    signup,
    logout,
  };
}

export function useCart() {
  const { state, dispatch } = useAppContext();

  const addRoom = (roomId: number) => {
    dispatch({ type: 'ADD_ROOM', payload: roomId });
  };

  const removeRoom = (roomId: number) => {
    dispatch({ type: 'REMOVE_ROOM', payload: roomId });
  };

  const addFood = (foodItemId: number, quantity: number) => {
    dispatch({ type: 'ADD_FOOD', payload: { foodItemId, quantity } });
  };

  const removeFood = (foodItemId: number) => {
    dispatch({ type: 'REMOVE_FOOD', payload: foodItemId });
  };

  const setCart = (cart: any) => {
    dispatch({ type: 'SET_CART', payload: cart });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setTotal = (total: number) => {
    dispatch({ type: 'SET_TOTAL', payload: total });
  };

  return {
    rooms: state.cart.rooms,
    foodItems: state.cart.foodItems,
    total: state.cart.total,
    addRoom,
    removeRoom,
    addFood,
    removeFood,
    setCart,
    clearCart,
    setTotal,
  };
}
