import { Heart, MessageCircle, UserMinus, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

/**
 * PersonCard displays a network connection with avatar, name, role, city, score, and actions.
 *
 * Props:
 * - user: { _id, displayName, username, role, displayPhoto, location, helpScore, hireScore }
 * - isFavourite: boolean
 * - onMessage: () => void
 * - onFavouriteToggle: () => void
 * - onRemove: () => void
 * - onBlock: () => void
 */
export default function PersonCard({
  user,
  isFavourite = false,
  onMessage,
  onFavouriteToggle,
  onRemove,
  onBlock,
}) {
  const initials = (user.displayName || user.username || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const score = user.role === "organiser" ? user.hireScore : user.helpScore;
  const city = user.location?.city;

  return (
    <Card className="relative">
      <CardContent className="flex flex-col items-center gap-3 pt-4 pb-4">
        {/* Avatar */}
        <Avatar className="h-16 w-16">
          {user.displayPhoto && (
            <AvatarImage src={getOptimizedImageUrl(user.displayPhoto, { width: 400 })} alt={user.displayName} />
          )}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        {/* Name and Role */}
        <div className="text-center space-y-1">
          <p className="font-semibold text-sm leading-tight">
            {user.displayName || user.username}
          </p>
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
        </div>

        {/* City */}
        {city && (
          <p className="text-xs text-muted-foreground">{city}</p>
        )}

        {/* Score */}
        {score != null && (
          <ScoreBadge score={score} role={user.role} size="sm" />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMessage}
            title="Message"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onFavouriteToggle}
            title={isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isFavourite && "fill-red-500 text-red-500"
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            title="Remove connection"
          >
            <UserMinus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBlock}
            title="Block user"
          >
            <Ban className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
