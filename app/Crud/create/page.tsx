'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL!;

enum EventMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

interface EventForm {
  title: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: EventMode;
  audience: string;
  agenda: string;
  organizer: string;
  tags: string;
}

export default function CreateEventPage() {
  const router = useRouter();

  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    overview: '',
    image: '',
    venue: '',
    location: '',
    date: '',
    time: '',
    mode: EventMode.OFFLINE,
    audience: '',
    agenda: '',
    organizer: '',
    tags: '',
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);

    try {
      setUploading(true);
      const res = await axios.post(`${API}/files/upload`, data);
      setForm((prev) => ({ ...prev, image: res.data.url }));
    } catch {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/events`, {
        ...form,
        agenda: form.agenda.split(',').map((i) => i.trim()),
        tags: form.tags.split(',').map((i) => i.trim()),
      });

      router.push('/Crud'); // Redirect to CRUD main page
    } catch (err) {
      console.error(err);
      alert('Event creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="label">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input-dark"
            placeholder="Event title"
          />
        </div>

        {/* Description + Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input-dark h-28"
              placeholder="Full description"
            />
          </div>
          <div>
            <label className="label">Overview</label>
            <textarea
              name="overview"
              value={form.overview}
              onChange={handleChange}
              className="input-dark h-28"
              placeholder="Short overview"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="label">Event Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
          {uploading && <p className="text-sm text-gray-400">Uploading...</p>}
          {form.image && <img src={form.image} className="mt-2 w-40 rounded border border-gray-600" />}
        </div>

        {/* Venue + Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Venue</label>
            <input name="venue" value={form.venue} onChange={handleChange} className="input-dark" />
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="input-dark" />
          </div>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="input-dark" />
          </div>
          <div>
            <label className="label">Time</label>
            <input type="time" name="time" value={form.time} onChange={handleChange} className="input-dark" />
          </div>
        </div>

        {/* Mode + Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Mode</label>
            <select name="mode" value={form.mode} onChange={handleChange} className="input-dark">
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="label">Audience</label>
            <input name="audience" value={form.audience} onChange={handleChange} className="input-dark" />
          </div>
        </div>

        {/* Agenda + Organizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Agenda (comma separated)</label>
            <input name="agenda" value={form.agenda} onChange={handleChange} className="input-dark" />
          </div>
          <div>
            <label className="label">Organizer</label>
            <input name="organizer" value={form.organizer} onChange={handleChange} className="input-dark" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags (comma separated)</label>
          <input name="tags" value={form.tags} onChange={handleChange} className="input-dark" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
