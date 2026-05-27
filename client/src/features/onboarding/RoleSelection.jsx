import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../../lib/axios";
import { updateUser } from "../auth/authSlice";

// ─── Role Card Data ────────────────────────────────────────────────────────────

const ROLES = [
  {
    id: "volunteer",
    label: "I want to Volunteer",
    tagline: "Contribute your time & skills",
    description:
      "Browse events near you, apply to causes you care about, build your helpScore and grow your impact.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <circle cx="24" cy="14" r="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 28l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    perks: ["Browse & apply to events", "Build your helpScore", "Get discovered by organisers"],
    accent: "#4f46e5",
    lightBg: "#eef2ff",
    border: "#c7d2fe",
    activeBorder: "#4f46e5",
    checkColor: "#4f46e5",
  },
  {
    id: "organiser",
    label: "I want to Post Events",
    tagline: "Find reliable volunteers fast",
    description:
      "Post your volunteer requirements, review applicants by helpScore, and manage your event team in one place.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="6" y="10" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M16 6v8M32 6v8M6 22h36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 30h4M16 36h10M28 30h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    perks: ["Post requirements publicly", "Filter by skills & location", "Build your hireScore"],
    accent: "#0891b2",
    lightBg: "#ecfeff",
    border: "#a5f3fc",
    activeBorder: "#0891b2",
    checkColor: "#0891b2",
  },
];

// ─── Perk Item ─────────────────────────────────────────────────────────────────

function PerkItem({ text, color }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-600">
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + "22" }}
      >
        <svg className="w-2.5 h-2.5" fill={color} viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
      {text}
    </li>
  );
}

// ─── Role Card ─────────────────────────────────────────────────────────────────

function RoleCard({ role, selected, onSelect }) {
  const isSelected = selected === role.id;
  return (
    <button
      type="button"
      onClick={() => onSelect(role.id)}
      className="relative w-full text-left rounded-2xl border-2 p-6 transition-all duration-200 focus:outline-none"
      style={{
        borderColor: isSelected ? role.activeBorder : role.border,
        backgroundColor: isSelected ? role.lightBg : "#fff",
        boxShadow: isSelected
          ? `0 0 0 4px ${role.accent}18, 0 4px 24px ${role.accent}14`
          : "0 1px 4px rgba(0,0,0,0.06)",
        transform: isSelected ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Selected badge */}
      {isSelected && (
        <span
          className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: role.accent }}
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl p-3 mb-4"
        style={{
          backgroundColor: role.lightBg,
          color: role.accent,
          border: `1.5px solid ${role.border}`,
        }}
      >
        {role.icon}
      </div>

      {/* Label + tagline */}
      <h3
        className="text-base font-extrabold tracking-tight mb-0.5"
        style={{ color: isSelected ? role.accent : "#111827" }}
      >
        {role.label}
      </h3>
      <p className="text-xs font-semibold text-gray-400 mb-3">{role.tagline}</p>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{role.description}</p>

      {/* Perks */}
      <ul className="space-y-1.5">
        {role.perks.map((perk) => (
          <PerkItem key={perk} text={perk} color={role.accent} />
        ))}
      </ul>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RoleSelection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);
    setError("");
    try {
      const { data } = await axios.patch("/auth/set-role", { role: selected });
      // Update Redux so user.role is set immediately
      dispatch(updateUser(data.user));
      navigate(`/profile-setup/${selected}`, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save role. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.id === selected);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8 max-w-sm">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-600 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          One-time setup
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
          How will you use Freiwilliger?
        </h1>
        <p className="text-sm text-gray-500">
          {user?.username ? `Welcome, ${user.username}! ` : ""}
          You can always change this later in settings.
        </p>
      </div>

      {/* Cards — side by side on sm+, stacked on mobile */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {ROLES.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={selected}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="mb-4 text-sm text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Continue button */}
      <div className="w-full max-w-2xl">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || isLoading}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            backgroundColor: selectedRole ? selectedRole.accent : "#d1d5db",
            color: "#fff",
            boxShadow: selectedRole
              ? `0 4px 14px ${selectedRole.accent}44`
              : "none",
          }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </>
          ) : selected ? (
            <>
              Continue as {selectedRole?.label.split(" ").slice(-1)[0]}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          ) : (
            "Select a role to continue"
          )}
        </button>
      </div>
    </div>
  );
}