import React, { createContext, useReducer, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, CartItem } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface CartState {
  rooms: number[];
  foodItems: CartItem[];
  total: number;
}

interface AppState {
  auth: AuthState;
  cart: CartState;
}

type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ROOM'; payload: number }
  | { type: 'REMOVE_ROOM'; payload: number }
  | { type: 'ADD_FOOD'; payload: CartItem }
  | { type: 'REMOVE_FOOD'; payload: number }
  | { type: 'SET_CART'; payload: CartState }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_TOTAL'; payload: number };

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const initialCartState: CartState = {
  rooms: [],
  foodItems: [],
  total: 0,
};

const initialState: AppState = {
  auth: initialAuthState,
  cart: initialCartState,
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
          isAuthenticated: true,
          error: null,
        },
      };
    case 'SET_TOKEN':
      return {
        ...state,
        auth: {
          ...state.auth,
          token: action.payload,
        },
      };
    case 'LOGOUT':
      return {
        auth: initialAuthState,
        cart: initialCartState,
      };
    case 'SET_LOADING':
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: action.payload,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        auth: {
          ...state.auth,
          error: action.payload,
        },
      };
    case 'ADD_ROOM':
      return {
        ...state,
        cart: {
          ...state.cart,
          rooms: [...state.cart.rooms, action.payload],
        },
      };
    case 'REMOVE_ROOM':
      return {
        ...state,
        cart: {
          ...state.cart,
          rooms: state.cart.rooms.filter((r) => r !== action.payload),
        },
      };
    case 'ADD_FOOD': {
      const existing = state.cart.foodItems.find((f) => f.foodItemId === action.payload.foodItemId);
      return {
        ...state,
        cart: {
          ...state.cart,
          foodItems: existing
            ? state.cart.foodItems.map((f) =>
                f.foodItemId === action.payload.foodItemId ? action.payload : f
              )
            : [...state.cart.foodItems, action.payload],
        },
      };
    }
    case 'REMOVE_FOOD':
      return {
        ...state,
        cart: {
          ...state.cart,
          foodItems: state.cart.foodItems.filter((f) => f.foodItemId !== action.payload),
        },
      };
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: initialCartState,
      };
    case 'SET_TOTAL':
      return {
        ...state,
        cart: {
          ...state.cart,
          total: action.payload,
        },
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (user && token) {
      try {
        let parsedUser = JSON.parse(user);
        // Ensure createdAt exists
        if (!parsedUser.createdAt) {
          parsedUser.createdAt = new Date().toISOString();
        }
        dispatch({ type: 'SET_USER', payload: parsedUser });
        dispatch({ type: 'SET_TOKEN', payload: token });
      } catch (error) {
        console.error('Failed to hydrate user from localStorage:', error);
      }
    }
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
