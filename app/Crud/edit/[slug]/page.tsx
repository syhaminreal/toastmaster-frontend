'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function EditEventPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API}/events/${slug}`)
      .then(res => setForm(res.data));
  }, [slug]);

  if (!form) return <p className="p-6">Loading...</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.patch(`${API}/events/${slug}`, form);
    router.push('/events');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md space-y-3">
      <h1 className="text-xl font-bold">Edit Event</h1>

      {Object.keys(form).map(key => (
        <input
          key={key}
          value={form[key] || ''}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="border p-2 w-full"
        />
      ))}

      <button className="bg-green-500 text-white px-4 py-2 rounded">
        Update
      </button>
    </form>
  );
}
