import { createSlice } from '@reduxjs/toolkit';
import * as analytics from '../../services/analytics';

const initialState = {
  user: null,       // { _id, username, name, role, profilePhotoUrl, location }
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  location: { lat: null, lng: null, city: null, state: null },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      // payload: { user, accessToken }
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      // Identify user in analytics
      const user = action.payload.user;
      if (user?._id) {
        analytics.identify(user._id, { role: user.role, city: user.location?.city });
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLocation: (state, action) => {
      // payload: { lat, lng, city, state }
      state.location = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      // Reset analytics on logout
      analytics.reset();
      analytics.track('user_logged_out');
    },
  },
});

export const { setCredentials, setLoading, setError, updateUser, setLocation, logout } =
  authSlice.actions;

export default authSlice.reducer;