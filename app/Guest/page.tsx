'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

interface Guest {
  id: string;
  email: string;
  eventId: string;
  createdAt: string;
  event?: {
    title: string;
  };
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/guest-emails`);
      const guestsData = res.data;

      if (guestsData.length > 0 && guestsData[0].event) {
        setGuests(guestsData);
      } else {
        // Fetch events for guests without event info
        const uniqueEventIds = [...new Set(guestsData.map(g => g.eventId))];
        const eventPromises = uniqueEventIds.map(eventId =>
          axios.get(`${BACKEND_URL}/events/${eventId}`)
            .then(res => ({ eventId, data: res.data }))
            .catch(() => ({ eventId, data: null }))
        );

        const eventResults = await Promise.all(eventPromises);
        const eventsMap: Record<string, any> = {};
        eventResults.forEach(result => {
          if (result.data) eventsMap[result.eventId] = result.data;
        });

        const enrichedGuests = guestsData.map(g => ({
          ...g,
          event: eventsMap[g.eventId] || null
        }));

        setGuests(enrichedGuests);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen">
        <p className="text-lg">Loading guest list...</p>
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="p-6 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Guest Signups</h1>
        <p>No guests found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Guest Signups ({guests.length})</h1>

      <div className="grid gap-4">
        {guests.map(guest => (
          <div
            key={guest.id}
            className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm"
          >
            <div className="flex flex-col gap-1 text-gray-800">
              <span className="font-semibold">Event:</span>
              <span>{guest.event?.title || guest.eventId}</span>

              <span className="font-semibold mt-2">Email:</span>
              <span>{guest.email}</span>

              <span className="font-semibold mt-2">Registered:</span>
              <span>
                {new Date(guest.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
