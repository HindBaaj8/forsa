// src/features/payment/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get all payments
export const getPayments = createAsyncThunk(
  'payment/getPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

// Get payment by order
export const getPaymentByOrder = createAsyncThunk(
  'payment/getPaymentByOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/order/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment not found');
    }
  }
);

// Create payment intent
export const createPaymentIntent = createAsyncThunk(
  'payment/createIntent',
  async ({ order_id, amount, provider }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/create-intent', {
        order_id,
        amount,
        provider
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment intent');
    }
  }
);

// Confirm payment
export const confirmPayment = createAsyncThunk(
  'payment/confirmPayment',
  async ({ order_id, transaction_id, provider }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/confirm', {
        order_id,
        transaction_id,
        provider
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment confirmation failed');
    }
  }
);

// Get payment status
export const getPaymentStatus = createAsyncThunk(
  'payment/getStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/status/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get payment status');
    }
  }
);

const initialState = {
  payments: {
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0
  },
  currentPayment: null,
  paymentStatus: null,
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    clearPaymentStatus: (state) => {
      state.paymentStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Payments
      .addCase(getPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload;
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Payment by Order
      .addCase(getPaymentByOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPaymentByOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(getPaymentByOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Confirm Payment
      .addCase(confirmPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Payment Status
      .addCase(getPaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentPayment, clearPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;