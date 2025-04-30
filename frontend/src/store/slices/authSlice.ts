// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import socketService from '../../services/socketService';
import { setAuthToken, removeAuthToken } from '../../utils/auth';

// Define the User type
export interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the auth state structure
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Define login response type
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// Initialize the auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Register a new user
export const register = createAsyncThunk<
  AuthResponse,
  { username: string; email: string; password: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Login a user
export const login = createAsyncThunk<
  AuthResponse,
  { emailOrUsername: string; password: string }
>('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.login(userData);
    // Connect to websocket after successful login
    socketService.connect();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Refresh the access token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const tokenToRefresh = localStorage.getItem('refresh_token'); // Переименовано для избежания конфликта имен
      if (!tokenToRefresh) {
        throw new Error('No refresh token available');
      }
      
      const response = await authService.refreshToken(tokenToRefresh);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Logout the user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Disconnect from websocket
      socketService.disconnect();
      // Remove auth tokens
      removeAuthToken();
      // Clear user state
      authService.logout();
      dispatch(clearUser());
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
);

// Load user profile
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Check if we have a token first
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Get the user profile
      const user = await authService.getProfile();
      
      // Connect to websocket if user is authenticated
      socketService.connect();
      
      return user;
    } catch (error: any) {
      // Исправление: не вызывать метод у строкового литерала
      const errorMsg = error.message || '';
      
      // If the error is due to an invalid/expired token and we have a refresh token
      if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        const tokenToRefresh = localStorage.getItem('refresh_token'); // Переименовано для избежания конфликта имен
        if (tokenToRefresh) {
          try {
            // Try to refresh the token - использование действия refreshToken вместо одноименной переменной
            await dispatch(refreshToken());
            // Then retry the loadUser
            return await authService.getProfile();
          } catch (refreshError) {
            // If refresh fails, clear auth state
            dispatch(logout());
            return rejectWithValue('Authentication expired. Please login again.');
          }
        }
      }
      
      return rejectWithValue(error.message);
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Load user cases
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearUser, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;