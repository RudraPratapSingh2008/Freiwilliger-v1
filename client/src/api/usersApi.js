import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
  reducerPath: "usersApi",
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
  tagTypes: ["ScoreHistory"],
  endpoints: (builder) => ({
    searchUsers: builder.query({
      query: ({ q, role }) => {
        const params = new URLSearchParams();
        if (q) params.append("q", q);
        if (role) params.append("role", role);
        return `/users/search?${params.toString()}`;
      },
      keepUnusedDataFor: 300,
    }),

    getScoreHistory: builder.query({
      query: () => "/users/me/score-history",
      keepUnusedDataFor: 300,
      providesTags: ["ScoreHistory"],
    }),
  }),
});

export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useGetScoreHistoryQuery,
} = usersApi;
