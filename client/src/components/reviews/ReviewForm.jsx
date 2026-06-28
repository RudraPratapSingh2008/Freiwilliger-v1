import React, { useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import * as analytics from '../../services/analytics';

export function ReviewForm({ eventId, revieweeId, revieweeRole, reviewerRole, onSubmit, isSubmitting }) {
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isNoShow, setIsNoShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars === 0) return; // Basic validation
    
    try {
      await onSubmit({
        eventId,
        revieweeId,
        stars,
        text: comment,
        noShow: isNoShow
      });
      analytics.track('review_submitted', { eventId, stars });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit review', error);
      // Let the parent component handle error toasts
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        <h3 className="text-lg font-semibold text-emerald-900">Review Submitted</h3>
        <p className="text-sm text-emerald-700 text-center">
          Thank you for sharing your feedback. Your review helps build trust in our community.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-5 rounded-xl border shadow-sm">
      <div className="space-y-2">
        <Label>Rate your experience</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setStars(star)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredStar || stars)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-200'
                }`}
              />
            </button>
          ))}
          <span className="ml-3 text-sm font-medium text-slate-500">
            {stars > 0 ? `${stars} out of 5` : 'Select a rating'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Written review (Optional)</Label>
        <Textarea
          id="comment"
          placeholder="Share details of your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none h-24"
          maxLength={1000}
        />
        <div className="text-xs text-right text-slate-400">
          {comment.length} / 1000
        </div>
      </div>

      {reviewerRole === 'organiser' && revieweeRole === 'volunteer' && (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50">
          <div className="space-y-0.5">
            <Label className="text-base text-red-600 font-semibold">Mark as No-Show</Label>
            <p className="text-xs text-slate-500">
              Only use this if the volunteer confirmed but did not attend the event.
            </p>
          </div>
          <Switch
            checked={isNoShow}
            onCheckedChange={setIsNoShow}
          />
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={stars === 0 || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
