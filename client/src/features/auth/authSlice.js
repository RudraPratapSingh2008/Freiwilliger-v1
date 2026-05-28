import { createSlice } from '@reduxjs/toolkit';

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
    },
  },
});

export const { setCredentials, setLoading, setError, updateUser, setLocation, logout } =
  authSlice.actions;

export default authSlice.reducer;