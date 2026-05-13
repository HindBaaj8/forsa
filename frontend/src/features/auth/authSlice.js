import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// 🔥🔥🔥 Update Profile - التصحيح 🔥🔥🔥
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      let config = {
        headers: { 'Accept': 'application/json' }
      };
      
      if (profileData instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
      
      // ✅ استعمل PUT بدل POST
      const response = await api.put('/auth/me', profileData, config);
      
      // ✅ تحديث localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = response.data.user || response.data.data || response.data;
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data);
      const errors = error.response?.data?.errors;
      const message = errors ? Object.values(errors).flat()[0] : error.response?.data?.message;
      return rejectWithValue(message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ current_password, new_password, new_password_confirmation }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-password', {
        current_password,
        new_password,
        new_password_confirmation
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      // ✅ تحديث user في Redux state
      state.user = { ...state.user, ...action.payload };
      // ✅ تحديث localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload.data || action.payload;
        state.isAuthenticated = true;
        // ✅ تحديث localStorage
        if (state.user) {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // 🔥 Update Profile - يتغير الـ Sidebar تلقائياً
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // استخراج المستخدم المحدث من الـ response
        const updatedUser = action.payload.user || action.payload.data || action.payload;
        state.user = { ...state.user, ...updatedUser };
        // ✅ تحديث localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateUser, setUser } = authSlice.actions;
export default authSlice.reducer;