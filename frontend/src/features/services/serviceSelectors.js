export const selectAllServices = (state) => state.services.items;
export const selectCurrentService = (state) => state.services.currentService;
export const selectServicesLoading = (state) => state.services.isLoading;
export const selectServicesError = (state) => state.services.error;
export const selectServicesPagination = (state) => state.services.pagination;
export const selectServicesFilters = (state) => state.services.filters;