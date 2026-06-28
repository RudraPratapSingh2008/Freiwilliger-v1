import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { INDIAN_STATES } from '@/data/indianStates';
import { useDiscoverByStateQuery } from '@/api/eventsApi';
import EventCard from '@/components/EventCard';

export default function StateDiscovery() {
  const [selectedState, setSelectedState] = useState('');

  const { data, isLoading, isError } = useDiscoverByStateQuery(
    { state: selectedState },
    { skip: !selectedState }
  );
  const events = data?.data?.events || data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Browse by State</h3>
      </div>

      <select
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-violet-300 focus:ring-1 focus:ring-violet-300 outline-none"
      >
        <option value="">Select a state</option>
        {INDIAN_STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      {selectedState && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Failed to load events for {selectedState}.
            </p>
          ) : events.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No events found in {selectedState}.
            </p>
          ) : (
            events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
