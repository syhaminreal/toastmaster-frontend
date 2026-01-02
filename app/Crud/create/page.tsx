'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL!;

enum EventMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export default function CreateEventPage() {
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    overview: '',
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();

      // append text fields
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      // append image (REQUIRED)
      if (!imageFile) {
        alert('Please select an image');
        setSubmitting(false);
        return;
      }

      data.append('image', imageFile);

      await axios.post(`${API}/events`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/Crud');
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
            required
          />
        </div>

        {/* Description & Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="input-dark h-28"
            required
          />
          <textarea
            name="overview"
            placeholder="Overview"
            value={form.overview}
            onChange={handleChange}
            className="input-dark h-28"
            required
          />
        </div>

        {/* Image */}
        <div>
          <label className="label">Event Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="file-input"
            required
          />

          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              className="mt-2 w-40 rounded border border-gray-600"
              alt="preview"
            />
          )}
        </div>

        {/* Venue & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="venue" placeholder="Venue" value={form.venue} onChange={handleChange} className="input-dark" />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="input-dark" />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" name="date" value={form.date} onChange={handleChange} className="input-dark" />
          <input type="time" name="time" value={form.time} onChange={handleChange} className="input-dark" />
        </div>

        {/* Mode & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="mode" value={form.mode} onChange={handleChange} className="input-dark">
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>
          <input name="audience" placeholder="Audience" value={form.audience} onChange={handleChange} className="input-dark" />
        </div>

        {/* Agenda & Organizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="agenda" placeholder="Agenda (comma separated)" value={form.agenda} onChange={handleChange} className="input-dark" />
          <input name="organizer" placeholder="Organizer" value={form.organizer} onChange={handleChange} className="input-dark" />
        </div>

        {/* Tags */}
        <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} className="input-dark" />

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
        >
          {submitting ? 'Creating...' : 'Create Event'}
        </button>

      </form>
    </div>
  );
}
