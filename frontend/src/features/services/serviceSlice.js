import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

/* =========================
   THUNKS
========================= */

// جلب جميع الخدمات
export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/services');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error loading services');
    }
  }
);

// خدمة في انتظار الموافقة
export const fetchPendingServices = createAsyncThunk(
  'services/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/services/pending');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// approve
export const approveService = createAsyncThunk(
  'services/approve',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/services/${id}/approve`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// reject
export const rejectService = createAsyncThunk(
  'services/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/services/${id}/reject`, { reason });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

/* =========================
   STATE
========================= */

const initialState = {
  items: [],
  pendingItems: [],
  currentItem: null,
  isLoading: false,
  error: null,
};

/* =========================
   SLICE
========================= */

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentService: (state, action) => {
      state.currentItem = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===== FETCH ALL =====
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data || action.payload || [];
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== PENDING =====
      .addCase(fetchPendingServices.fulfilled, (state, action) => {
        state.pendingItems = action.payload?.data || action.payload || [];
      })

      // ===== APPROVE =====
      .addCase(approveService.fulfilled, (state, action) => {
        const updated = action.payload;

        const i = state.items.findIndex(s => s.id === updated.id);
        if (i !== -1) state.items[i] = updated;

        if (state.currentItem?.id === updated.id) {
          state.currentItem = updated;
        }
      })

      // ===== REJECT =====
      .addCase(rejectService.fulfilled, (state, action) => {
        const updated = action.payload;

        const i = state.items.findIndex(s => s.id === updated.id);
        if (i !== -1) state.items[i] = updated;

        if (state.currentItem?.id === updated.id) {
          state.currentItem = updated;
        }
      });
  },
});

/* =========================
   EXPORTS
========================= */

export const { clearError, setCurrentService } = serviceSlice.actions;
export default serviceSlice.reducer;