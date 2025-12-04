import apiClient from './apiClient';
import type { AuthResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    const { accessToken, refreshToken, id, email: userEmail, fullName } = response.data;
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify({ id, email: userEmail, fullName }));
    return response.data;
  },

  signup: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', { email, password, fullName });
    const { accessToken, refreshToken, id, email: userEmail, fullName: name } = response.data;
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify({ id, email: userEmail, fullName: name }));
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined') return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};
