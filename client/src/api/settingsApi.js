import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ---------------------------------------------------------------------------
// API slice
// ---------------------------------------------------------------------------

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // -----------------------------------------------------------------------
    // Mutations
    // -----------------------------------------------------------------------

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/settings/profile",
        method: "PATCH",
        body,
      }),
    }),

    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: "/settings/security/password",
        method: "PATCH",
        body: { currentPassword, newPassword },
      }),
    }),

    updateVisibility: builder.mutation({
      query: (body) => ({
        url: "/settings/visibility",
        method: "PATCH",
        body,
      }),
    }),

    updateNotifications: builder.mutation({
      query: (body) => ({
        url: "/settings/notifications",
        method: "PATCH",
        body,
      }),
    }),

    deleteAccount: builder.mutation({
      query: () => ({
        url: "/settings/account",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUpdateVisibilityMutation,
  useUpdateNotificationsMutation,
  useDeleteAccountMutation,
} = settingsApi;
