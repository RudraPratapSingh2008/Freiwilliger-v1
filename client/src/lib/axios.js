import axios from 'axios';
import store from '../app/store';
import { setCredentials, logout } from '../features/auth/authSlice';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // needed so the httpOnly refreshToken cookie is sent
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue of requests that failed while a refresh was already in-flight
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  isRefreshing = false;
  failedQueue = [];
};

// Request interceptor — attach access token from Redux store
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — on 401 call our own refresh endpoint, retry, or logout
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that haven't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {

      // If a refresh is already running, queue this request until it resolves
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Call our own backend — the httpOnly cookie carries the refresh token
        const response = await axiosInstance.post('/auth/refresh-token');
        const { accessToken, user } = response.data.data;

        store.dispatch(setCredentials({ user, accessToken }));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;