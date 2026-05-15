// hooks/useAdminData.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, getRequests, getWorkers, getCategories } from '../features/admin/adminSlice';

export const useAdminData = () => {
  const dispatch = useDispatch();
  const { users, requests, workers, categories } = useSelector((state) => state.admin);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(getUsers()),
        dispatch(getRequests()),
        dispatch(getWorkers()),
        dispatch(getCategories()),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  return {
    users: users || [],
    setUsers: () => {},
    requests: requests || [],
    setRequests: () => {},
    workers: workers || [],
    setWorkers: () => {},
    categories: categories || [],
    setCategories: () => {},
    loading,
  };
};