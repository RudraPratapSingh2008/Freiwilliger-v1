import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ---------------------------------------------------------------------------
// API slice
// ---------------------------------------------------------------------------

export const contactRequestsApi = createApi({
  reducerPath: "contactRequestsApi",
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
  tagTypes: ["ContactRequests"],
  endpoints: (builder) => ({
    // -----------------------------------------------------------------------
    // Queries
    // -----------------------------------------------------------------------

    getMyContactRequests: builder.query({
      query: () => "/contact-requests/mine",
      providesTags: ["ContactRequests"],
    }),

    // -----------------------------------------------------------------------
    // Mutations
    // -----------------------------------------------------------------------

    createContactRequest: builder.mutation({
      query: ({ volunteerId, eventId, reason, details }) => ({
        url: "/contact-requests",
        method: "POST",
        body: { volunteerId, eventId, reason, details },
      }),
      invalidatesTags: ["ContactRequests"],
    }),

    respondToContactRequest: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact-requests/${id}/volunteer-response`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ContactRequests"],
    }),
  }),
});

export const {
  useCreateContactRequestMutation,
  useGetMyContactRequestsQuery,
  useRespondToContactRequestMutation,
} = contactRequestsApi;
