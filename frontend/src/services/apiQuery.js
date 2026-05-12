// services/apiQuery.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Services', 'Requests', 'Orders', 'Conversations'],
  endpoints: (builder) => ({
    // Services
    getServices: builder.query({
      query: (params) => ({ url: '/services', params }),
      providesTags: ['Services'],
    }),
    getService: builder.query({
      query: (id) => `/services/${id}`,
      providesTags: (result, error, id) => [{ type: 'Services', id }],
    }),
    createService: builder.mutation({
      query: (data) => ({
        url: '/services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Services'],
    }),
    updateService: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Services', id }],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Services'],
    }),
    
    // Orders
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Orders'],
    }),
    startOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
    completeOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetOrdersQuery,
  useStartOrderMutation,
  useCompleteOrderMutation,
} = apiSlice;