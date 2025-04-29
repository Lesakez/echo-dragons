// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { setAuthToken, removeAuthToken } from '../../utils/auth';

interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      setAuthToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData: { emailOrUsername: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(userData);
      setAuthToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }
      
      const response = await authService.refreshToken(refreshToken);
      setAuthToken(response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    removeAuthToken();
    localStorage.removeItem('refresh_token');
    dispatch(clearUser());
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

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
    }
  },
  extraReducers: (builder) => {
    // Обработка регистрации
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка входа
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Обработка загрузки профиля
    builder.addCase(loadUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(loadUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
      state.user = null;
    });

    // Обработка обновления токена
    builder.addCase(refreshToken.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(refreshToken.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    });
  }
});

export const { clearUser, clearError } = authSlice.actions;
export default authSlice.reducer;