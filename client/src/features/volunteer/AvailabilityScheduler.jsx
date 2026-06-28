import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';
import axios from '../../lib/axios';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AvailabilityScheduler({ initialAvailability = [] }) {
  const [availability, setAvailability] = useState(
    DAYS.map((day) => {
      const existing = initialAvailability.find((a) => a.day === day);
      return {
        day,
        enabled: !!existing,
        startTime: existing?.startTime || '09:00',
        endTime: existing?.endTime || '18:00',
      };
    })
  );
  const [saving, setSaving] = useState(false);

  const toggleDay = (day) => {
    setAvailability((prev) =>
      prev.map((d) => (d.day === day ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const updateTime = (day, field, value) => {
    setAvailability((prev) =>
      prev.map((d) => (d.day === day ? { ...d, [field]: value } : d))
    );
  };

  const save = async () => {
    setSaving(true);
    const data = availability
      .filter((d) => d.enabled)
      .map(({ day, startTime, endTime }) => ({ day, startTime, endTime }));
    try {
      await axios.patch('/users/me/volunteer-profile', { availability: data });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Availability</h3>
      </div>
      <div className="space-y-2">
        {availability.map(({ day, enabled, startTime, endTime }) => (
          <div key={day} className="flex items-center gap-3">
            <Switch checked={enabled} onCheckedChange={() => toggleDay(day)} />
            <span className="w-10 text-sm font-medium">{day}</span>
            {enabled && (
              <div className="flex items-center gap-1 text-sm">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => updateTime(day, 'startTime', e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
                <span>–</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => updateTime(day, 'endTime', e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Availability'}
      </Button>
    </Card>
  );
}
