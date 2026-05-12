import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getInterests = createAsyncThunk(
  'interests/getByRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/requests/${requestId}/interests`);
      return { requestId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendInterest = createAsyncThunk(
  'interests/send',
  async ({ requestId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/requests/${requestId}/interests`, { message });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const acceptInterest = createAsyncThunk(
  'interests/accept',
  async (interestId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interests/${interestId}/accept`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const rejectInterest = createAsyncThunk(
  'interests/reject',
  async (interestId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interests/${interestId}/reject`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  items: {},
  isLoading: false,
  error: null,
};

const interestSlice = createSlice({
  name: 'interests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInterests.fulfilled, (state, action) => {
        state.items[action.payload.requestId] = action.payload.data;
      })
      .addCase(sendInterest.fulfilled, (state, action) => {
        const requestId = action.meta.arg.requestId;
        if (!state.items[requestId]) {
          state.items[requestId] = [];
        }
        state.items[requestId].unshift(action.payload);
      })
      .addCase(acceptInterest.fulfilled, (state, action) => {
        // Update interest status in all lists
        Object.keys(state.items).forEach(requestId => {
          state.items[requestId] = state.items[requestId].map(i =>
            i.id === action.payload.id ? action.payload : i
          );
        });
      })
      .addCase(rejectInterest.fulfilled, (state, action) => {
        Object.keys(state.items).forEach(requestId => {
          state.items[requestId] = state.items[requestId].map(i =>
            i.id === action.payload.id ? action.payload : i
          );
        });
      });
  },
});

export const { clearError } = interestSlice.actions;
export default interestSlice.reducer;