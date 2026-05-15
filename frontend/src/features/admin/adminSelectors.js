// فـ نهاية الملف (قبل export default)

// Selectors
export const selectAdminDashboard = (state) => state.admin.dashboard;
export const selectAdminUsers = (state) => state.admin.users;
export const selectAdminWorkers = (state) => state.admin.workers;
export const selectAdminRequests = (state) => state.admin.requests;
export const selectAdminCategories = (state) => state.admin.categories;
export const selectAdminFinance = (state) => state.admin.finance;
export const selectAdminAlerts = (state) => state.admin.alerts;
export const selectAdminLoading = (state) => state.admin.isLoading;
export const selectAdminError = (state) => state.admin.error;