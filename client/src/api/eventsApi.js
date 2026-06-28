import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFeedQueryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, value);
  });
  const query = params.toString();
  return query ? `/events/feed?${query}` : "/events/feed";
}

// ---------------------------------------------------------------------------
// API slice
// ---------------------------------------------------------------------------

export const eventsApi = createApi({
  reducerPath: "eventsApi",
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
  tagTypes: ["Event", "Feed", "Applicants", "MyEventsVolunteer", "MyEventsOrganiser"],
  endpoints: (builder) => ({
    // -----------------------------------------------------------------------
    // Queries
    // -----------------------------------------------------------------------

    getFeed: builder.query({
      query: (filters) => buildFeedQueryString(filters),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((event) => ({ type: "Event", id: event._id })),
              { type: "Feed", id: "LIST" },
            ]
          : [{ type: "Feed", id: "LIST" }],
    }),

    getEvent: builder.query({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    getApplicants: builder.query({
      query: (eventId) => `/events/${eventId}/applicants`,
      providesTags: (result, error, eventId) => [{ type: "Applicants", id: eventId }],
    }),

    getMyEventsVolunteer: builder.query({
      query: () => "/events/my/volunteer",
      providesTags: [{ type: "MyEventsVolunteer", id: "LIST" }],
    }),

    getMyEventsOrganiser: builder.query({
      query: () => "/events/my/organiser",
      providesTags: [{ type: "MyEventsOrganiser", id: "LIST" }],
    }),

    // -----------------------------------------------------------------------
    // Mutations
    // -----------------------------------------------------------------------

    createEvent: builder.mutation({
      query: (body) => ({
        url: "/events",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Feed", id: "LIST" }, { type: "MyEventsOrganiser", id: "LIST" }],
    }),

    applyToEvent: builder.mutation({
      query: (eventId) => ({
        url: `/events/${eventId}/apply`,
        method: "POST",
      }),
      // Optimistically flip applicationStatus on the single-event cache and
      // on every getFeed cache entry currently held in the store.
      async onQueryStarted(eventId, { dispatch, queryFulfilled, getState }) {
        const patches = [];

        patches.push(
          dispatch(
            eventsApi.util.updateQueryData("getEvent", eventId, (draft) => {
              draft.applicationStatus = "pending";
            })
          )
        );

        const feedCacheKeys = eventsApi.util.selectCachedArgsForQuery(
          getState(),
          "getFeed"
        );

        feedCacheKeys.forEach((filters) => {
          patches.push(
            dispatch(
              eventsApi.util.updateQueryData("getFeed", filters, (draft) => {
                const event = draft.data.find((e) => e._id === eventId);
                if (event) event.applicationStatus = "pending";
              })
            )
          );
        });

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (result, error, eventId) => [{ type: "Event", id: eventId }],
    }),

    withdrawApplication: builder.mutation({
      query: (eventId) => ({
        url: `/events/${eventId}/apply`,
        method: "DELETE",
      }),
      async onQueryStarted(eventId, { dispatch, queryFulfilled, getState }) {
        const patches = [];

        patches.push(
          dispatch(
            eventsApi.util.updateQueryData("getEvent", eventId, (draft) => {
              draft.applicationStatus = "withdrew";
            })
          )
        );

        const feedCacheKeys = eventsApi.util.selectCachedArgsForQuery(
          getState(),
          "getFeed"
        );

        feedCacheKeys.forEach((filters) => {
          patches.push(
            dispatch(
              eventsApi.util.updateQueryData("getFeed", filters, (draft) => {
                const event = draft.data.find((e) => e._id === eventId);
                if (event) event.applicationStatus = "withdrew";
              })
            )
          );
        });

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (result, error, eventId) => [{ type: "Event", id: eventId }],
    }),

    respondToApplicant: builder.mutation({
      query: ({ eventId, userId, action }) => ({
        url: `/events/${eventId}/applicants/${userId}`,
        method: "PATCH",
        body: { action },
      }),
      // Optimistic update so the Applicant Management UI feels instant —
      // the real source of truth still arrives via invalidation below.
      async onQueryStarted({ eventId, userId, action }, { dispatch, queryFulfilled }) {
        const statusMap = { select: "selected", reject: "rejected", shortlist: "shortlisted" };
        const patch = dispatch(
          eventsApi.util.updateQueryData("getApplicants", eventId, (draft) => {
            const applicant = draft.data.find((a) => a._id === userId);
            if (applicant && statusMap[action]) {
              applicant.status = statusMap[action];
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Applicants", id: eventId },
        { type: "Event", id: eventId },
      ],
    }),

    markAttendance: builder.mutation({
      query: ({ eventId, volunteerId, attended }) => ({
        url: `/events/${eventId}/mark-attendance`,
        method: "POST",
        body: { volunteerId, attended },
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Applicants", id: eventId },
        { type: "Event", id: eventId },
      ],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useApplyToEventMutation,
  useWithdrawApplicationMutation,
  useGetApplicantsQuery,
  useRespondToApplicantMutation,
  useGetMyEventsVolunteerQuery,
  useGetMyEventsOrganiserQuery,
  useMarkAttendanceMutation,
} = eventsApi;