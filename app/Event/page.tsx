'use client';

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api'; // adjust path if your lib folder is elsewhere
import EventCard from '../components/EventCard';

type Event = {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
};

export default function EventsPage() {
  const { data: events, isLoading, error } = useQuery<Event[], Error>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      console.log('GET /events', res.status, res.data);
      return res.data;
    },
  });

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events: {error.message}</div>;
  if (!events || events.length === 0) return <div>No events returned</div>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          image={`/uploads/${event.image}`} // adjust path if needed
          date={event.date}
          location={event.location}
        />
      ))}
    </div>
  );
}
