import React from 'react';
import { Star, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from '../../utils/date'; // Or implement a simple relative date here

// Simple relative date formatter if the util doesn't exist yet
const formatRelative = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((new Date() - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  const days = Math.floor(diffInSeconds / 86400);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString();
};

export function ReviewCard({ review }) {
  if (!review || !review.reviewerId) return null;

  const {
    reviewerId,
    stars,
    comment,
    isNoShow,
    createdAt
  } = review;

  const {
    username,
    role,
    volunteerProfile,
    organiserProfile
  } = reviewerId;

  // Determine photo and name depending on populated data structure
  // Usually from the controller populate: volunteerProfile.profilePhoto, organiserProfile.profilePhoto, organiserProfile.logo
  const photo = role === 'organiser'
    ? organiserProfile?.logo || organiserProfile?.profilePhoto
    : volunteerProfile?.profilePhoto;
    
  const initials = username ? username.substring(0, 2).toUpperCase() : 'U';
  const roleLabel = role === 'organiser' ? 'Organiser' : 'Volunteer';
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border">
            <AvatarImage src={photo} alt={username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{username}</span>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-slate-500">
                {roleLabel}
              </Badge>
            </div>
            
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= stars ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
                  }`}
                />
              ))}
              <span className="text-xs text-slate-400 ml-2">
                {formatRelative(createdAt)}
              </span>
            </div>
          </div>
        </div>

        {isNoShow && (
          <Badge variant="destructive" className="flex items-center gap-1 shadow-sm">
            <AlertTriangle className="w-3 h-3" />
            No-Show
          </Badge>
        )}
      </div>

      {comment && (
        <p className="text-sm text-slate-700 leading-relaxed break-words">
          {comment}
        </p>
      )}
    </div>
  );
}
