import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldCheck } from "lucide-react";
import axios from "../../lib/axios";
import { useGetUserReviewsQuery } from "@/api/reviewsApi";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import ProfileCompleteness from "../../components/ProfileCompleteness";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-gray-200 rounded-lg animate-pulse ${className}`}
      style={{ animationDuration: "1.4s" }}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-4/6" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
      </div>
    </div>
  );
}

// ─── Score Badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score, role }) {
  const isVolunteer = role === "volunteer";
  const label = isVolunteer ? "helpScore" : "hireScore";
  const color = isVolunteer ? "#4f46e5" : "#0891b2";
  const bg = isVolunteer ? "#eef2ff" : "#ecfeff";

  const tier =
    score >= 80 ? "Elite" : score >= 60 ? "Pro" : score >= 40 ? "Active" : "New";
  const tierColor =
    score >= 80 ? "#d97706" : score >= 60 ? "#7c3aed" : score >= 40 ? "#16a34a" : "#6b7280";

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
      style={{ backgroundColor: bg, color }}
    >
      <svg className="w-3.5 h-3.5" fill={color} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {score} {label}
      <span
        className="px-1.5 py-0.5 rounded-full text-white text-[10px] font-extrabold"
        style={{ backgroundColor: tierColor }}
      >
        {tier}
      </span>
    </div>
  );
}

// ─── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-3.5 h-3.5"
          fill={star <= rating ? "#f59e0b" : "#e5e7eb"}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ["About", "Reviews", "Work History"];

// ─── About Tab ────────────────────────────────────────────────────────────────

function AboutTab({ profile }) {
  const hasSkills = profile.skills?.length > 0;
  const hasLanguages = profile.languages?.length > 0;

  return (
    <div className="space-y-5 pt-4">
      {/* Bio */}
      {profile.bio && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Bio</p>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Skills */}
      {hasSkills && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {hasLanguages && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Languages</p>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Gender",        value: profile.gender },
          { label: "Qualification", value: profile.qualification },
          { label: "City",          value: profile.city },
          { label: "Member since",  value: profile.joinedAt
              ? new Date(profile.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
              : null },
        ]
          .filter((item) => item.value)
          .map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{item.value}</p>
            </div>
          ))}
      </div>

      {!hasSkills && !hasLanguages && !profile.bio && (
        <p className="text-sm text-gray-400 text-center py-6">No details added yet.</p>
      )}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab({ reviews = [], averageStars = 0, totalReviews = 0, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="pt-4 space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
        <p className="text-xs text-gray-400 mt-1">Reviews appear after completing events</p>
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-4">
      {/* Average */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
        <span className="text-3xl font-extrabold text-amber-600">{averageStars.toFixed(1)}</span>
        <div>
          <StarRating rating={Math.round(averageStars)} />
          <p className="text-xs text-gray-500 mt-0.5">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* List */}
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  );
}

// ─── Work History Tab ─────────────────────────────────────────────────────────

function WorkHistoryTab({ history = [] }) {
  if (history.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-500">No events completed yet</p>
        <p className="text-xs text-gray-400 mt-1">Completed events will appear here</p>
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-3">
      {history.map((item, idx) => (
        <div key={item._id || idx} className="flex items-start gap-3 border border-gray-100 rounded-xl p-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
            {idx < history.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 mt-1.5 min-h-[24px]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.eventTitle}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.organiserName}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-100">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </span>
              {item.date && (
                <span className="text-[10px] text-gray-400">
                  {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────

function ActionButtons({ profile, onMessage, onAddNetwork, onFavourite, isFavourited, isInNetwork }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-2 safe-bottom">
      {/* Message */}
      <button
        onClick={onMessage}
        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Message
      </button>

      {/* Add to network */}
      <button
        onClick={onAddNetwork}
        className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-all border-2 ${
          isInNetwork
            ? "border-green-500 text-green-700 bg-green-50"
            : "border-gray-200 text-gray-700 bg-white hover:border-gray-300"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isInNetwork ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          )}
        </svg>
        {isInNetwork ? "Connected" : "Connect"}
      </button>

      {/* Favourite */}
      <button
        onClick={onFavourite}
        className={`w-14 flex items-center justify-center rounded-xl border-2 transition-all active:scale-[0.98] ${
          isFavourited
            ? "border-red-300 bg-red-50 text-red-500"
            : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
        }`}
      >
        <svg className="w-5 h-5" fill={isFavourited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PublicProfile() {
  const { username } = useParams();    // route: /profile/:username
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [activeTab, setActiveTab]   = useState("About");
  const [isFavourited, setFavourited] = useState(false);
  const [isInNetwork, setInNetwork]   = useState(false);

  // profile.reviews from GET /profile/public/:username is always [] server-side
  // (profile.controller.js hardcodes it as a placeholder) — fetch the real
  // reviews from the dedicated endpoint instead.
  const { data: reviewsRes, isFetching: reviewsLoading } = useGetUserReviewsQuery(
    profile?._id,
    { skip: !profile?._id }
  );
  const reviewsData = reviewsRes?.data || { reviews: [], averageStars: 0, totalReviews: 0 };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`/profile/public/${username}`);
        setProfile(data.data.profile);
        setFavourited(data.data.isFavourited || false);
        setInNetwork(data.data.isInNetwork || false);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) setError("This profile doesn't exist.");
        else setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleMessage = () => {
    navigate(`/messages?with=${profile._id}`);
  };

  const handleAddNetwork = async () => {
    try {
      await axios.post(`/network/request/${profile._id}`);
      setInNetwork((prev) => !prev);
    } catch {
      // silent fail — will be handled properly in Day 38 (Network page)
    }
  };

  const handleFavourite = async () => {
    try {
      await axios.post(`/profile/favourite/${profile._id}`);
      setFavourited((prev) => !prev);
    } catch {
      // silent fail
    }
  };

  // ── Loading state ──
  if (loading) return <ProfileSkeleton />;

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-700">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-bold text-gray-900 flex-1 truncate">
          @{profile.username}
        </h2>
        {isOwnProfile && (
          <button
            onClick={() => navigate("/settings/profile")}
            className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
          >
            Edit
          </button>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* ── Profile header ── */}
        <div className="flex items-start gap-4 mb-5">
          {/* Avatar */}
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex-shrink-0 bg-indigo-100 flex items-center justify-center text-3xl font-extrabold text-indigo-500 border-2 border-white shadow-md">
              {profile.name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}

          {/* Name / username / meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight truncate">
                {profile.name || profile.username}
              </h1>
              {profile.idVerificationStatus === 'verified' && (
                <ShieldCheck className="h-4.5 w-4.5 text-green-600 shrink-0" aria-label="Verified" />
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium mb-2">@{profile.username}</p>

            {/* Score badge */}
            <ScoreBadge
              score={profile.role === "volunteer" ? profile.helpScore ?? 0 : profile.hireScore ?? 0}
              role={profile.role}
            />

            {/* City */}
            {profile.city && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.city}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Events", value: profile.eventsCount ?? 0 },
            { label: "Reviews", value: profile.reviewsCount ?? 0 },
            { label: "Network", value: profile.networkCount ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Profile Completeness (own profile only) ── */}
        {isOwnProfile && (
          <ProfileCompleteness user={profile} isOwnProfile={isOwnProfile} />
        )}

        {/* ── Tabs ── */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all duration-150 ${
                activeTab === tab
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "About"        && <AboutTab profile={profile} />}
        {activeTab === "Reviews"      && (
          <ReviewsTab
            reviews={reviewsData.reviews}
            averageStars={reviewsData.averageStars}
            totalReviews={reviewsData.totalReviews}
            isLoading={reviewsLoading}
          />
        )}
        {activeTab === "Work History" && <WorkHistoryTab history={profile.workHistory} />}
      </div>

      {/* ── Action buttons (not shown on own profile) ── */}
      {!isOwnProfile && (
        <ActionButtons
          profile={profile}
          onMessage={handleMessage}
          onAddNetwork={handleAddNetwork}
          onFavourite={handleFavourite}
          isFavourited={isFavourited}
          isInNetwork={isInNetwork}
        />
      )}
    </div>
  );
}