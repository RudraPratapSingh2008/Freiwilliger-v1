import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include', // send httpOnly refreshToken cookie on every request
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({

    // Step 1 of phone auth — send Firebase ID token, get back JWT or isNewUser flag
    phoneAuth: builder.mutation({
      query: (firebaseIdToken) => ({
        url: '/auth/phone',
        method: 'POST',
        body: { firebaseIdToken },
      }),
      // Returns: { isNewUser: true } OR { accessToken, user }
    }),

    // Step 2 of phone auth — called only when isNewUser: true
    completeRegistration: builder.mutation({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        // payload: { username, password, role: 'volunteer'|'organiser', firebaseIdToken }
        body: payload,
      }),
    }),

    // Alternative login: username + password (NOT email)
    login: builder.mutation({
      query: ({ username, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { username, password },
      }),
    }),

    // Refresh access token using httpOnly cookie
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
    }),

    // Logout — clears refreshToken cookie on server
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // Forgot password — client re-does Firebase phone verify, sends new token + password
    forgotPassword: builder.mutation({
      query: ({ firebaseIdToken, newPassword }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { firebaseIdToken, newPassword },
      }),
    }),
  }),
});

export const {
  usePhoneAuthMutation,
  useCompleteRegistrationMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
} = authApi;