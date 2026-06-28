import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ---------------------------------------------------------------------------
// API slice
// ---------------------------------------------------------------------------

export const supportApi = createApi({
  reducerPath: "supportApi",
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

    submitReport: builder.mutation({
      query: (formData) => ({
        url: "/support/report",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useSubmitReportMutation } = supportApi;
