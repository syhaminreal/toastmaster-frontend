'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/* ---------------- Types ---------------- */
type EventData = {
  id: string;
  title: string;
  description: string;
  image: string;
  overview: string;
  date: string;
  time: string;
  location: string;
  mode: string;
  audience: string;
  tags: string[] | string;
  agenda: string[] | string;
  organizer: string;
};

type FormData = {
  title: string;
  description: string;
  overview: string;
  date: string;
  time: string;
  location: string;
  mode: string;
  audience: string;
  tags: string;
  agenda: string;
  organizer: string;
};

/* ---------------- Helper Functions ---------------- */
const getImageSrc = (image: string | null | undefined): string => {
  if (!image || image.trim() === '') return '/placeholder-event.jpg';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return image;
  return `/uploads/${image}`;
};

const parseArrayField = (field: string[] | string): string => {
  if (Array.isArray(field)) return field.join(', ');
  try {
    const parsed = JSON.parse(field || '[]');
    return Array.isArray(parsed) ? parsed.join(', ') : field;
  } catch {
    return field || '';
  }
};

/* ---------------- Update Event Page Component ---------------- */
const UpdateEventPage = ({ params }: { params: { slug: string } }) => {
  const router = useRouter();
  const { slug } = params;

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    overview: '',
    date: '',
    time: '',
    location: '',
    mode: '',
    audience: '',
    tags: '',
    agenda: '',
    organizer: '',
  });

  // Fetch existing event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/events/${slug}`);
        const event: EventData = response.data.event || response.data;

        // Format date for input (YYYY-MM-DD)
        let formattedDate = event.date;
        if (event.date) {
          const dateObj = new Date(event.date);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0];
          }
        }

        setFormData({
          title: event.title || '',
          description: event.description || '',
          overview: event.overview || '',
          date: formattedDate,
          time: event.time || '',
          location: event.location || '',
          mode: event.mode || '',
          audience: event.audience || '',
          tags: parseArrayField(event.tags),
          agenda: parseArrayField(event.agenda),
          organizer: event.organizer || '',
        });

        setCurrentImage(event.image || '');
        setError(null);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected new image
  const removeNewImage = () => {
    setNewImage(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Prepare form data for multipart upload
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('overview', formData.overview);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
      submitData.append('location', formData.location);
      submitData.append('mode', formData.mode);
      submitData.append('audience', formData.audience);
      submitData.append('organizer', formData.organizer);

      // Convert comma-separated strings to JSON arrays
      const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const agendaArray = formData.agenda.split(',').map((a) => a.trim()).filter(Boolean);
      
      submitData.append('tags', JSON.stringify(tagsArray));
      submitData.append('agenda', JSON.stringify(agendaArray));

      // Add new image if selected
      if (newImage) {
        submitData.append('image', newImage);
      }

      // Send PUT/PATCH request
      await axios.put(`${BASE_URL}/api/events/${slug}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/Event/${slug}`);
      }, 2000);

    } catch (err: any) {
      console.error("Error updating event:", err);
      setError(err.response?.data?.message || "Failed to update event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <section id="update-event" className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/Event/${slug}`}
          className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Event
        </Link>
        <h1 className="text-3xl font-bold">Update Event</h1>
        <p className="text-gray-600 mt-2">Edit the event details below</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-medium">✅ Event updated successfully!</p>
          <p className="text-sm">Redirecting to event page...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-medium">❌ Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Update Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Current Image Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Current Image</label>
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={imagePreview || getImageSrc(currentImage)}
              alt="Event Banner"
              fill
              className="object-cover"
            />
            {imagePreview && (
              <button
                type="button"
                onClick={removeNewImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          
          {/* Image Upload */}
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Change Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/80 file:cursor-pointer"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter event title"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Short Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Brief description of the event"
          />
        </div>

        {/* Overview */}
        <div className="space-y-2">
          <label htmlFor="overview" className="block text-sm font-medium">
            Overview *
          </label>
          <textarea
            id="overview"
            name="overview"
            value={formData.overview}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Detailed overview of the event"
          />
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="time" className="block text-sm font-medium">
              Time *
            </label>
            <input
              type="text"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., 10:00 AM - 2:00 PM"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Event venue or address"
          />
        </div>

        {/* Mode & Audience Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="mode" className="block text-sm font-medium">
              Mode *
            </label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="audience" className="block text-sm font-medium">
              Target Audience *
            </label>
            <input
              type="text"
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Students, Professionals"
            />
          </div>
        </div>

        {/* Organizer */}
        <div className="space-y-2">
          <label htmlFor="organizer" className="block text-sm font-medium">
            Organizer *
          </label>
          <textarea
            id="organizer"
            name="organizer"
            value={formData.organizer}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Information about the organizer"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label htmlFor="tags" className="block text-sm font-medium">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Comma-separated tags (e.g., workshop, speaking, leadership)"
          />
          <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
        </div>

        {/* Agenda */}
        <div className="space-y-2">
          <label htmlFor="agenda" className="block text-sm font-medium">
            Agenda Items
          </label>
          <textarea
            id="agenda"
            name="agenda"
            value={formData.agenda}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Comma-separated agenda items (e.g., Registration, Opening speech, Workshop)"
          />
          <p className="text-xs text-gray-500">Separate multiple agenda items with commas</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Event'
            )}
          </button>

          <Link
            href={`/Event/${slug}`}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
};

export default UpdateEventPage;
