// utils/createCrudSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const createCrudSlice = ({ name, endpoint, transformResponse = (data) => data }) => {
  // Async Thunks
  const getAll = createAsyncThunk(
    `${name}/getAll`,
    async (params = {}, { rejectWithValue }) => {
      try {
        const response = await api.get(endpoint, { params });
        return transformResponse(response.data);
      } catch (error) {
        return rejectWithValue(error.response?.data?.message);
      }
    }
  );

  const getOne = createAsyncThunk(
    `${name}/getOne`,
    async (id, { rejectWithValue }) => {
      try {
        const response = await api.get(`${endpoint}/${id}`);
        return transformResponse(response.data);
      } catch (error) {
        return rejectWithValue(error.response?.data?.message);
      }
    }
  );

  const create = createAsyncThunk(
    `${name}/create`,
    async (data, { rejectWithValue }) => {
      try {
        const response = await api.post(endpoint, data);
        return transformResponse(response.data);
      } catch (error) {
        return rejectWithValue(error.response?.data?.message);
      }
    }
  );

  const update = createAsyncThunk(
    `${name}/update`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await api.put(`${endpoint}/${id}`, data);
        return transformResponse(response.data);
      } catch (error) {
        return rejectWithValue(error.response?.data?.message);
      }
    }
  );

  const remove = createAsyncThunk(
    `${name}/remove`,
    async (id, { rejectWithValue }) => {
      try {
        await api.delete(`${endpoint}/${id}`);
        return id;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message);
      }
    }
  );

  const initialState = {
    items: [],
    currentItem: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    isLoading: false,
    error: null,
  };

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      clearError: (state) => {
        state.error = null;
      },
      clearCurrentItem: (state) => {
        state.currentItem = null;
      },
    },
    extraReducers: (builder) => {
      builder
        // getAll
        .addCase(getAll.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(getAll.fulfilled, (state, action) => {
          state.isLoading = false;
          state.items = action.payload.data || action.payload;
          if (action.payload.meta) {
            state.pagination = action.payload.meta;
          }
        })
        .addCase(getAll.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })
        // getOne
        .addCase(getOne.fulfilled, (state, action) => {
          state.currentItem = action.payload;
        })
        // create
        .addCase(create.fulfilled, (state, action) => {
          state.items.unshift(action.payload);
        })
        // update
        .addCase(update.fulfilled, (state, action) => {
          const index = state.items.findIndex(i => i.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          if (state.currentItem?.id === action.payload.id) {
            state.currentItem = action.payload;
          }
        })
        // remove
        .addCase(remove.fulfilled, (state, action) => {
          state.items = state.items.filter(i => i.id !== action.payload);
        });
    },
  });

  return {
    slice,
    thunks: { getAll, getOne, create, update, remove },
    actions: slice.actions,
  };
};