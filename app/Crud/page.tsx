'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL!;

interface Event {
  title: string;
  slug: string;
  image?: string;
  date?: string;
  location?: string;
  time?: string;
}

export default function EventsCrudPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/events`)
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this event?')) return;

    try {
      await axios.delete(`${API}/events/${slug}`);
      setEvents(events.filter(e => e.slug !== slug));
    } catch {
      alert('Delete failed');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Events</h1>

     
        <Link href="/Crud/create"
          className="bg-blue-500 text-white px-4 py-2 rounded">Create Event
          </Link>

      </div>

      <table className="w-full border">
        <thead className="bg-dark-100">
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Slug</th>
            <th className="border p-2">Image</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {events.map(event => (
            <tr key={event.slug}>
              <td className="border p-2">{event.title}</td>
              <td className="border p-2">{event.slug}</td>

              <td className="border p-2">
                <div className="relative w-24 h-14">
                  <Image
                    src={event.image || '/placeholder-event.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              </td>

              <td className="border p-2">{event.date || '-'}</td>

              <td className="border p-2">
               
                <Link href={`/Crud/edit/${event.slug}`}
                 className="text-blue-600 mr-3"
                >Edit
                </Link>


                <button
                  onClick={() => handleDelete(event.slug)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
