import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PersonCard from "@/components/network/PersonCard";
import {
  useGetNetworkQuery,
  useGetFavouritesQuery,
  useRemoveConnectionMutation,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,
  useBlockUserMutation,
} from "@/api/networkApi";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterBySearch(connections, term) {
  if (!term.trim()) return connections;
  const lower = term.toLowerCase();
  return connections.filter(
    (c) =>
      (c.displayName && c.displayName.toLowerCase().includes(lower)) ||
      (c.username && c.username.toLowerCase().includes(lower))
  );
}

// ---------------------------------------------------------------------------
// NetworkPage
// ---------------------------------------------------------------------------

export default function NetworkPage() {
  const navigate = useNavigate();

  // RTK Query
  const { data: network = [], isLoading: networkLoading } = useGetNetworkQuery();
  const { data: favourites = [], isLoading: favouritesLoading } = useGetFavouritesQuery();
  const [removeConnection] = useRemoveConnectionMutation();
  const [addFavourite] = useAddFavouriteMutation();
  const [removeFavourite] = useRemoveFavouriteMutation();
  const [blockUser] = useBlockUserMutation();

  // Search with 300ms debounce
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [searchInput]);

  // Filtered lists
  const filteredNetwork = useMemo(
    () => filterBySearch(network, debouncedSearch),
    [network, debouncedSearch]
  );
  const filteredFavourites = useMemo(
    () => filterBySearch(favourites, debouncedSearch),
    [favourites, debouncedSearch]
  );

  // Favourites set for quick lookup
  const favouriteIds = useMemo(
    () => new Set(favourites.map((f) => f._id)),
    [favourites]
  );

  // Remove confirmation dialog state
  const [removeTarget, setRemoveTarget] = useState(null);

  const handleConfirmRemove = useCallback(async () => {
    if (removeTarget) {
      await removeConnection(removeTarget._id);
      setRemoveTarget(null);
    }
  }, [removeTarget, removeConnection]);

  // Actions
  const handleMessage = useCallback(
    (user) => {
      navigate("/messages", { state: { userId: user._id } });
    },
    [navigate]
  );

  const handleFavouriteToggle = useCallback(
    (user) => {
      if (favouriteIds.has(user._id)) {
        removeFavourite(user._id);
      } else {
        addFavourite(user._id);
      }
    },
    [favouriteIds, addFavourite, removeFavourite]
  );

  const handleBlock = useCallback(
    (user) => {
      blockUser(user._id);
    },
    [blockUser]
  );

  // Loading state
  const isLoading = networkLoading || favouritesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Network</h1>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search connections..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="network">
        <TabsList className="w-full">
          <TabsTrigger value="network" className="flex-1">
            My Network
          </TabsTrigger>
          <TabsTrigger value="favourites" className="flex-1">
            Favourites
          </TabsTrigger>
        </TabsList>

        {/* My Network Tab */}
        <TabsContent value="network">
          {filteredNetwork.length === 0 ? (
            <EmptyState message="No connections yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredNetwork.map((user) => (
                <PersonCard
                  key={user._id}
                  user={user}
                  isFavourite={favouriteIds.has(user._id)}
                  onMessage={() => handleMessage(user)}
                  onFavouriteToggle={() => handleFavouriteToggle(user)}
                  onRemove={() => setRemoveTarget(user)}
                  onBlock={() => handleBlock(user)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Favourites Tab */}
        <TabsContent value="favourites">
          {filteredFavourites.length === 0 ? (
            <EmptyState message="No favourites yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredFavourites.map((user) => (
                <PersonCard
                  key={user._id}
                  user={user}
                  isFavourite={true}
                  onMessage={() => handleMessage(user)}
                  onFavouriteToggle={() => handleFavouriteToggle(user)}
                  onRemove={() => setRemoveTarget(user)}
                  onBlock={() => handleBlock(user)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Remove confirmation dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">
                {removeTarget?.displayName || removeTarget?.username}
              </span>{" "}
              from your network? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state helper
// ---------------------------------------------------------------------------

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
