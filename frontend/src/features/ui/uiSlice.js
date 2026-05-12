import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: 'light', // 'light' or 'dark'
  activeModal: null,
  globalLoading: false,
  mobileMenuOpen: false,
  toast: {
    show: false,
    message: '',
    type: 'success', // 'success', 'error', 'info', 'warning'
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    showToast: (state, action) => {
      state.toast = {
        show: true,
        message: action.payload.message,
        type: action.payload.type || 'success',
      };
    },
    hideToast: (state) => {
      state.toast = {
        ...state.toast,
        show: false,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  openModal,
  closeModal,
  setGlobalLoading,
  toggleMobileMenu,
  showToast,
  hideToast,
} = uiSlice.actions;
export default uiSlice.reducer;