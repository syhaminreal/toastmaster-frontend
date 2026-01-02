'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// ✅ Safe URL helper for Next.js Image
const getImageSrc = (image?: string | null) => {
  if (!image || image.trim() === '') return '/placeholder-event.jpg';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return `${API}${image}`;
  return '/placeholder-event.jpg';
};

export default function EditEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [form, setForm] = useState<EventForm | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    axios.get(`${API}/events/${slug}`).then((res) => {
      const d = res.data;
      setForm({
        title: d.title,
        description: d.description,
        overview: d.overview,
        image: d.image || '',
        venue: d.venue,
        location: d.location,
        date: d.date,
        time: d.time,
        mode: d.mode,
        audience: d.audience,
        agenda: d.agenda.join(', '),
        organizer: d.organizer,
        tags: d.tags.join(', '),
      });
    });
  }, [slug]);

  if (!form) return <p className="p-6 text-white">Loading...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setForm((prev) => ({ ...prev!, image: res.data.url }));
      setImgError(false); // reset error after upload
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
      await axios.patch(`${API}/events/${slug}`, {
        ...form,
        agenda: form.agenda.split(',').map((i) => i.trim()),
        tags: form.tags.split(',').map((i) => i.trim()),
      });

      router.push('/Crud');
    } catch (err) {
      console.error(err);
      alert('Event update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} className="input-dark" />
        <textarea name="description" value={form.description} onChange={handleChange} className="input-dark h-24" />
        <textarea name="overview" value={form.overview} onChange={handleChange} className="input-dark h-20" />

        {/* IMAGE UPLOAD */}
        <div className="space-y-2 relative w-80 h-40">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p className="text-sm">Uploading...</p>}

          {form.image && (
            <Image
              src={imgError ? '/placeholder-event.jpg' : getImageSrc(form.image)}
              alt="preview"
              fill
              className="rounded border object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
          )}
        </div>

        <input name="venue" value={form.venue} onChange={handleChange} className="input-dark" />
        <input name="location" value={form.location} onChange={handleChange} className="input-dark" />

        <div className="grid grid-cols-2 gap-4">
          <input type="date" name="date" value={form.date} onChange={handleChange} className="input-dark" />
          <input type="time" name="time" value={form.time} onChange={handleChange} className="input-dark" />
        </div>

        <select name="mode" value={form.mode} onChange={handleChange} className="input-dark">
          <option value={EventMode.OFFLINE}>Offline</option>
          <option value={EventMode.ONLINE}>Online</option>
        </select>

        <input name="audience" value={form.audience} onChange={handleChange} className="input-dark" />
        <input name="agenda" value={form.agenda} onChange={handleChange} className="input-dark" />
        <input name="organizer" value={form.organizer} onChange={handleChange} className="input-dark" />
        <input name="tags" value={form.tags} onChange={handleChange} className="input-dark" />

        <button
          type="submit"
          className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
          disabled={submitting}
        >
          {submitting ? 'Updating...' : 'Update Event'}
        </button>
      </form>
    </div>
  );
}
