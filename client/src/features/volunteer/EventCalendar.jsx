import { useState, useMemo } from 'react';
import { useGetMyEventsVolunteerQuery } from '@/api/eventsApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function EventCalendar() {
  const { data } = useGetMyEventsVolunteerQuery();
  const events = data?.data || data || [];
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      if (!event.dateTime?.start) return;
      const date = new Date(event.dateTime.start).toISOString().split('T')[0];
      if (!map[date]) map[date] = [];
      map[date].push(event);
    });
    return map;
  }, [events]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {monthName}
        </h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          return (
            <div
              key={day}
              className={`p-1 rounded-lg text-sm ${isToday ? 'bg-primary text-white' : ''} ${dayEvents.length > 0 ? 'font-bold' : ''}`}
            >
              {day}
              {dayEvents.length > 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mx-auto mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
