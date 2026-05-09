// hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout, getCurrentUser } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const handleLogin = (credentials) => dispatch(login(credentials));
  const handleRegister = (userData) => dispatch(register(userData));
  const handleLogout = () => dispatch(logout());
  const fetchUser = () => dispatch(getCurrentUser());

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    fetchUser,
  };
};