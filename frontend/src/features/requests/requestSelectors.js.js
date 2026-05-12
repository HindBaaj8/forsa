export const selectAllRequests = (state) => state.requests.items;
export const selectCurrentRequest = (state) => state.requests.currentRequest;
export const selectRequestsLoading = (state) => state.requests.isLoading;
export const selectRequestsError = (state) => state.requests.error;
export const selectRequestsPagination = (state) => state.requests.pagination;