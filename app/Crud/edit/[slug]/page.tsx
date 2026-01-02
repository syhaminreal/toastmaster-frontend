import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

interface Guest {
  id: string;
  email: string;
  eventId: string;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  slug: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${BACKEND_URL}/guest-emails`),
      axios.get(`${BACKEND_URL}/events`),
    ])
      .then(([guestsRes, eventsRes]) => {
        setGuests(guestsRes.data);
        setEvents(eventsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const getEventTitle = (eventId: string) => {
    const event = events.find((e) => e.slug === eventId);
    return event?.title || eventId;
  };

  if (loading) return <p className="p-6">Loading guest list...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Guest Signups</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Email</th>
            <th className="border p-2">Event</th>
            <th className="border p-2">Date Signed Up</th>
          </tr>
        </thead>

        <tbody>
          {guests.map((guest) => (
            <tr key={guest.id}>
              <td className="border p-2">{guest.email}</td>
              <td className="border p-2">{getEventTitle(guest.eventId)}</td>
              <td className="border p-2">{new Date(guest.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
