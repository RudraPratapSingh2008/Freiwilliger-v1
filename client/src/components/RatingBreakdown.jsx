import { Star } from 'lucide-react';

export default function RatingBreakdown({ reviews = [] }) {
  const total = reviews.length;
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.stars === stars).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { stars, count, percentage };
  });

  const average =
    total > 0
      ? (reviews.reduce((sum, r) => sum + r.stars, 0) / total).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">{average}</span>
        <div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i <= Math.round(average) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{total} reviews</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {breakdown.map(({ stars, count, percentage }) => (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <span className="w-3 text-muted-foreground">{stars}</span>
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-xs text-muted-foreground text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
