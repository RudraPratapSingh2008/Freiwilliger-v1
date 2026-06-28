import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ---------------------------------------------------------------------------
// API slice
// ---------------------------------------------------------------------------
// Matches server/src/routes/reviews.routes.js + review.controller.js:
//   POST   /reviews                — create a review
//   GET    /reviews/user/:userId   — { reviews, averageStars, totalReviews }
//   GET    /reviews/event/:eventId — reviews for a single event

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
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
  tagTypes: ["UserReviews", "EventReviews"],
  keepUnusedDataFor: 120,
  endpoints: (builder) => ({
    getUserReviews: builder.query({
      query: (userId) => `/reviews/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: "UserReviews", id: userId }],
    }),

    getEventReviews: builder.query({
      query: (eventId) => `/reviews/event/${eventId}`,
      providesTags: (result, error, eventId) => [{ type: "EventReviews", id: eventId }],
    }),

    // body: { eventId, revieweeId, stars, text, noShow }
    createReview: builder.mutation({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { eventId, revieweeId }) => [
        { type: "UserReviews", id: revieweeId },
        { type: "EventReviews", id: eventId },
      ],
    }),
  }),
});

export const {
  useGetUserReviewsQuery,
  useGetEventReviewsQuery,
  useCreateReviewMutation,
} = reviewsApi;
