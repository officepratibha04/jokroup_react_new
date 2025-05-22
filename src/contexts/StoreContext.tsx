// storeReducer.ts or StoreContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Product, User, CartItem, WishlistItem, Coupon } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { products, users, coupons } from '@/api/api';

interface StoreState {
  products: Product[];
  filteredProducts: Product[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  currentUser: User | null;
  isLoggedIn: boolean;
  searchQuery: string;
  users: User[];
  coupons: Coupon[];
  filters: {
    categories: string[];
    priceRange: [number, number];
    colors: string[];
    sizes: string[];
  };
  loading: boolean;
  authError: string | null;
}

type StoreAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_FILTERED_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_ITEM'; payload: CartItem }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING_STATE'; payload: boolean }
  | { type: 'SET_AUTH_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<StoreState['filters']> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_COUPONS'; payload: Coupon[] };

const initialState: StoreState = {
  products: [],
  filteredProducts: [],
  cart: [],
  wishlist: [],
  currentUser: null,
  isLoggedIn: false,
  searchQuery: '',
  users: [],
  coupons: [],
  filters: {
    categories: [],
    priceRange: [0, 5000],
    colors: [],
    sizes: [],
  },
  loading: false,
  authError: null,
};

const getItemFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return null;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const storeReducer = (state: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    case 'SET_FILTERED_PRODUCTS':
      return { ...state, filteredProducts: action.payload };

    case 'SET_USER':
      return { ...state, currentUser: action.payload, isLoggedIn: action.payload !== null };

    case 'SET_COUPONS':
      return { ...state, coupons: action.payload };

    case 'SET_LOADING_STATE':
      return { ...state, loading: action.payload };

    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.payload };

    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item =>
        item.productId === action.payload.productId &&
        item.color === action.payload.color &&
        item.size === action.payload.size
      );

      const newCart = existingItem
        ? state.cart.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.cart, action.payload];

      saveToStorage('cart', newCart);
      return { ...state, cart: newCart };
    }

    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter(item => item.id !== action.payload);
      saveToStorage('cart', newCart);
      return { ...state, cart: newCart };
    }

    case 'UPDATE_CART_ITEM': {
      const newCart = state.cart.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      saveToStorage('cart', newCart);
      return { ...state, cart: newCart };
    }

    case 'CLEAR_CART':
      localStorage.removeItem('cart');
      return { ...state, cart: [] };

    case 'ADD_TO_WISHLIST': {
      const exists = state.wishlist.some(item => item.productId === action.payload);
      if (exists) return state;

      const newWishlist = [...state.wishlist, { id: Date.now().toString(), productId: action.payload }];
      saveToStorage('wishlist', newWishlist);
      return { ...state, wishlist: newWishlist };
    }

    case 'REMOVE_FROM_WISHLIST': {
      const newWishlist = state.wishlist.filter(item => item.productId !== action.payload);
      saveToStorage('wishlist', newWishlist);
      return { ...state, wishlist: newWishlist };
    }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters, searchQuery: '' };

    default:
      return state;
  }
};

interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  addToCart: (product: Product, quantity: number, color: string, size: string) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  applyFilters: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING_STATE', payload: true });
      try {
        const [productsData, usersData, couponsData] = await Promise.all([
          products().catch(() => []),
          users().catch(() => []),
          coupons().catch(() => []),
        ]);

        dispatch({ type: 'SET_PRODUCTS', payload: productsData });
        dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: productsData });
        dispatch({ type: 'SET_COUPONS', payload: couponsData });

        const currentUser = getItemFromStorage('currentUser');
        if (currentUser) {
          dispatch({ type: 'SET_USER', payload: currentUser });
        }

        const cart = getItemFromStorage('cart') || [];
        const wishlist = getItemFromStorage('wishlist') || [];

        cart.forEach((item: CartItem) => dispatch({ type: 'ADD_TO_CART', payload: item }));
        wishlist.forEach((item: WishlistItem) => dispatch({ type: 'ADD_TO_WISHLIST', payload: item.productId }));
      } catch (error) {
        console.error('Initialization error:', error);
        toast({ title: 'Error', description: 'Failed to initialize app data', variant: 'destructive' });
      } finally {
        dispatch({ type: 'SET_LOADING_STATE', payload: false });
      }
    };

    fetchInitialData();
  }, []);

  const applyFilters = useCallback(() => {
    const { searchQuery, filters, products } = state;

    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    if (filters.colors.length > 0) {
      filtered = filtered.filter(product => product.colors.some(color => filters.colors.includes(color)));
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter(product => product.sizes.some(size => filters.sizes.includes(size)));
    }

    dispatch({ type: 'SET_FILTERED_PRODUCTS', payload: filtered });
  }, [state.products, state.searchQuery, state.filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const addToCart = (product: Product, quantity: number, color: string, size: string) => {
    const newCartItem: CartItem = {
      id: Date.now().toString(),
      productId: product.id,
      quantity,
      color,
      size,
    };
    dispatch({ type: 'ADD_TO_CART', payload: newCartItem });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const updateCartItem = (id: string, quantity: number) => {
    const updatedItem = state.cart.find(item => item.id === id);
    if (updatedItem) {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { ...updatedItem, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToWishlist = (productId: string) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: productId });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const isInWishlist = (productId: string) => {
    return state.wishlist.some(item => item.productId === productId);
  };

  // Helper to decode JWT and check expiration
const isTokenExpired = (token: string) => {
  try {
    const jwt = token.replace('Bearer ', '');
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
};

// Get token from storage, check expiration, relogin if needed
const getValidToken = async (email?: string, password?: string): Promise<string | null> => {
  let token = localStorage.getItem('token');
  if (token && !isTokenExpired(token)) {
    return token;
  }
  // If expired and credentials provided, relogin
  if (email && password) {
    const reloginSuccess = await login(email, password);
    if (reloginSuccess) {
      token = localStorage.getItem('token');
      if (token && !isTokenExpired(token)) {
        return token;
      }
    }
  }
  return null;
};

  const login = async (email: string, password: string): Promise<boolean> => {
  dispatch({ type: 'SET_LOADING_STATE', payload: true });
  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        username: email.trim(),
        password: password.trim()
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      dispatch({ type: 'SET_AUTH_ERROR', payload: errorData.detail || 'Login failed' });
      return false;
    }

    const data = await response.json();

    // Save token as Bearer for OAuth2PasswordBearer
    localStorage.setItem('token', `Bearer ${data.access_token}`);

    // Save all user info from response
    const user = {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      password: '', // Default or empty, as password is not returned by API
      addresses: data.addresses || [], // Default to empty array if not present
      createdAt: data.createdAt || new Date().toISOString(), // Default to now if not present
      role: data.role,
      avatar: data.avatar,
      token_type: data.token_type,
      access_token: data.access_token,
    };
    localStorage.setItem('currentUser', JSON.stringify(user));

    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'SET_AUTH_ERROR', payload: null });
    return true;
  } catch (error) {
    dispatch({ type: 'SET_AUTH_ERROR', payload: 'Login error' });
    return false;
  } finally {
    dispatch({ type: 'SET_LOADING_STATE', payload: false });
  }
};

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING_STATE', payload: true });
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      dispatch({ type: 'SET_USER', payload: data.user });
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING_STATE', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    dispatch({ type: 'SET_USER', payload: null });
    toast({ title: 'Logged out', description: 'You have successfully logged out.' });
  };

  return (
    <StoreContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      login,
      register,
      logout,
      applyFilters,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
