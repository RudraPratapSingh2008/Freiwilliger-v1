import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../api/authApi';
import { eventsApi } from '../api/eventsApi';
import { reviewsApi } from '../api/reviewsApi';
import { networkApi } from '../api/networkApi';
import { settingsApi } from '../api/settingsApi';
import { supportApi } from '../api/supportApi';
import { contactRequestsApi } from '../api/contactRequestsApi';
import { usersApi } from '../api/usersApi';
import { adminApi } from '../api/adminApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [networkApi.reducerPath]: networkApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [contactRequestsApi.reducerPath]: contactRequestsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      eventsApi.middleware,
      reviewsApi.middleware,
      networkApi.middleware,
      settingsApi.middleware,
      supportApi.middleware,
      usersApi.middleware,
      contactRequestsApi.middleware,
      adminApi.middleware
    ),
});

export default store;
