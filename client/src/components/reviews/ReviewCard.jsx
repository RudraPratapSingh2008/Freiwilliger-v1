import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

const getTierColor = (score) => {
  if (score >= 80) return 'bg-emerald-500 text-white';
  if (score >= 60) return 'bg-blue-500 text-white';
  if (score >= 40) return 'bg-amber-500 text-white';
  if (score >= 20) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
};

const getTierLabel = (score, role) => {
  const isVolunteer = role !== 'organiser';
  if (score >= 80) return isVolunteer ? '🏆 Top Volunteer' : '🏆 Trusted Organiser';
  if (score >= 60) return isVolunteer ? '✅ Reliable Volunteer' : '✅ Good Organiser';
  if (score >= 40) return isVolunteer ? '🌱 Building Reputation' : '🌱 New Organiser';
  if (score >= 20) return isVolunteer ? '⚠️ Needs Improvement' : '⚠️ Review Carefully';
  return isVolunteer ? '🚫 Low Trust' : '🚫 Caution';
};

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function ScoreBadge({ score, role = 'volunteer', size = 'md', className }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const colorClass = getTierColor(safeScore);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const label = getTierLabel(safeScore, role);

  return (
    <div className="group relative inline-flex items-center justify-center">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold shadow-sm',
          colorClass,
          sizeClass,
          className
        )}
      >
        {safeScore}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {label}
        </div>
        <div className="w-2 h-2 bg-slate-900 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>
    </div>
  );
}