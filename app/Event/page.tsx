'use client';

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import EventCard from '../components/EventCard';
import Link from 'next/link';

type Event = {
  id: string;
  title: string;
  slug: string; // <-- need slug to link to detail page
  image: string;
  date: string;
  location: string;
  time?: string;
};

// Helper function to determine the correct image path
const getImageSrc = (image: string | null | undefined): string => {
  if (!image || image.trim() === '') return '/placeholder-event.jpg';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return image;
  return `/uploads/${image}`;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-500">
          Error loading events: {error.message}
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-500">No events found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col gap-3">
            <EventCard
              title={event.title}
              image={getImageSrc(event.image)}
              date={event.date}
              location={event.location}
              time={event.time} slug={''}            />
            {/* View Details Button */}
            <Link
              href={`/Event/${event.slug}`}
              className="text-center mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
