'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    date: '',
    location: '',
    image: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await axios.post(`${API}/events`, form);
    router.push('/events');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md space-y-3">
      <h1 className="text-xl font-bold">Create Event</h1>

      {Object.keys(form).map(key => (
        <input
          key={key}
          placeholder={key}
          value={(form as any)[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="border p-2 w-full"
        />
      ))}

      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Create
      </button>
    </form>
  );
}
