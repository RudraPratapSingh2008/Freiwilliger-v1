import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminUsers', 'AdminReports', 'AdminContactRequests', 'AdminStats'],
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),

    getUsers: builder.query({
      query: ({ page = 1, limit = 20, search = '', role = '', accountStatus = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);
        if (role) params.append('role', role);
        if (accountStatus) params.append('accountStatus', accountStatus);
        return `/admin/users?${params.toString()}`;
      },
      providesTags: ['AdminUsers'],
    }),

    banUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}/ban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminUsers', 'AdminStats'],
    }),

    unbanUser: builder.mutation({
      query: (userId) => ({
        url: `/admin/users/${userId}/unban`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminUsers', 'AdminStats'],
    }),

    getReports: builder.query({
      query: ({ page = 1, limit = 20, status = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (status) params.append('status', status);
        return `/admin/reports?${params.toString()}`;
      },
      providesTags: ['AdminReports'],
    }),

    updateReport: builder.mutation({
      query: ({ reportId, status }) => ({
        url: `/admin/reports/${reportId}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['AdminReports', 'AdminStats'],
    }),

    getContactRequests: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        return `/admin/contact-requests?${params.toString()}`;
      },
      providesTags: ['AdminContactRequests'],
    }),

    approveContactRequest: builder.mutation({
      query: (requestId) => ({
        url: `/admin/contact-requests/${requestId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminContactRequests', 'AdminStats'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useGetReportsQuery,
  useUpdateReportMutation,
  useGetContactRequestsQuery,
  useApproveContactRequestMutation,
} = adminApi;
