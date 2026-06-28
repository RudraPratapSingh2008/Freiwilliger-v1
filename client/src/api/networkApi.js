import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ---------------------------------------------------------------------------
// API slice
// ---------------------------------------------------------------------------

export const networkApi = createApi({
  reducerPath: "networkApi",
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
  tagTypes: ["Network", "Favourites"],
  endpoints: (builder) => ({
    // -----------------------------------------------------------------------
    // Queries
    // -----------------------------------------------------------------------

    getNetwork: builder.query({
      query: () => "/network",
      providesTags: ["Network"],
    }),

    getFavourites: builder.query({
      query: () => "/network/favourites",
      providesTags: ["Favourites"],
    }),

    // -----------------------------------------------------------------------
    // Mutations
    // -----------------------------------------------------------------------

    addFavourite: builder.mutation({
      query: (userId) => ({
        url: `/network/favourites/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Favourites", "Network"],
    }),

    removeFavourite: builder.mutation({
      query: (userId) => ({
        url: `/network/favourites/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favourites"],
    }),

    removeConnection: builder.mutation({
      query: (userId) => ({
        url: `/network/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Network", "Favourites"],
    }),

    blockUser: builder.mutation({
      query: (userId) => ({
        url: `/network/block/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Network", "Favourites"],
    }),

    unblockUser: builder.mutation({
      query: (userId) => ({
        url: `/network/block/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Network"],
    }),
  }),
});

export const {
  useGetNetworkQuery,
  useGetFavouritesQuery,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,
  useRemoveConnectionMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
} = networkApi;
