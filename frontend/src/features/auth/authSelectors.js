export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsClient = (state) => state.auth.user?.role === 'client';
export const selectIsWorker = (state) => state.auth.user?.role === 'worker';
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';