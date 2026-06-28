import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Search, User, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { useLazySearchUsersQuery } from "@/api/usersApi";
import * as analytics from "../services/analytics";

const RECENT_SEARCHES_KEY = "freiwilliger_recent_searches";
const MAX_RECENT = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRecentSearches() {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(user) {
  const recent = getRecentSearches();
  // Remove duplicates
  const filtered = recent.filter((r) => r.username !== user.username);
  const updated = [
    { username: user.username, displayName: user.displayName },
    ...filtered,
  ].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// ---------------------------------------------------------------------------
// SearchOverlay
// ---------------------------------------------------------------------------

export default function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);

  const [triggerSearch, { data: results, isFetching }] =
    useLazySearchUsersQuery();

  // Auto-focus input when overlay opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setRecentSearches(getRecentSearches());
      // Small delay to ensure the overlay is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Debounced search
  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.trim()) {
        debounceRef.current = setTimeout(() => {
          triggerSearch({ q: value.trim() });
          analytics.track('search_performed', { query: value.trim() });
        }, 300);
      }
    },
    [triggerSearch]
  );

  // Click on a result
  const handleResultClick = useCallback(
    (user) => {
      saveRecentSearch(user);
      navigate(`/profile/${user.username}`);
      onClose();
    },
    [navigate, onClose]
  );

  // Click on a recent search
  const handleRecentClick = useCallback(
    (recent) => {
      navigate(`/profile/${recent.username}`);
      onClose();
    },
    [navigate, onClose]
  );

  // Clear recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const searchResults = results?.data || results || [];
  const showNoResults = hasQuery && !isFetching && searchResults.length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <Input
          ref={inputRef}
          placeholder="Search people..."
          value={query}
          onChange={handleInputChange}
          className="flex-1 border-0 shadow-none focus-visible:ring-0 text-base"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close search"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Recent Searches (when no query) */}
        {!hasQuery && recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Recent Searches</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearRecent}
                className="text-xs text-muted-foreground"
              >
                Clear all
              </Button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((recent) => (
                <button
                  key={recent.username}
                  onClick={() => handleRecentClick(recent)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {recent.displayName || recent.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{recent.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {hasQuery && isFetching && (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Searching...</div>
          </div>
        )}

        {/* Search Results */}
        {hasQuery && !isFetching && searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((user) => (
              <button
                key={user._id || user.username}
                onClick={() => handleResultClick(user)}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.displayPhoto || user.profilePhoto}
                    alt={user.displayName || user.username}
                  />
                  <AvatarFallback>
                    {(user.displayName || user.username || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {user.displayName || user.username}
                    </p>
                    <Badge variant="secondary" className="text-[10px]">
                      {user.role}
                    </Badge>
                  </div>
                  {user.city && (
                    <p className="text-xs text-muted-foreground truncate">
                      {user.city}
                    </p>
                  )}
                </div>

                {(user.helpScore != null || user.hireScore != null) && (
                  <ScoreBadge
                    score={user.helpScore ?? user.hireScore ?? 0}
                    role={user.role}
                    size="sm"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No results found — try different terms
            </p>
          </div>
        )}

        {/* Default empty state (no query, no recent) */}
        {!hasQuery && recentSearches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              Search for volunteers and organisers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
