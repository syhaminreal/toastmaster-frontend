'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import BookEvent from "../../components/BookingCard";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not defined");

/* ---------------- Helper Function ---------------- */
const getImageSrc = (image?: string | null) => {
  if (!image || image.trim() === "") return "/placeholder-event.jpg";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/")) return `${BASE_URL}${image}`;
  return "/placeholder-event.jpg";
};

/* ---------------- Event Tags ---------------- */
const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

/* ---------------- Event Detail Item ---------------- */
type EventDetailItemProps = {
  icon: string;
  alt: string;
  label: string;
};

const EventDetailItem = ({ icon, alt, label }: EventDetailItemProps) => (
  <div className="flex gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

/* ---------------- Event Agenda ---------------- */
const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

/* ---------------- Event Type ---------------- */
type Event = {
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

/* ---------------- Event Detail Page ---------------- */
const EventDetailPage = ({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) => {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  // Resolve params if it's a Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    resolveParams();
  }, [params]);

  // Fetch event data
  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${slug}`);
        setEvent(response.data.event || response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Event not found</h2>
          <Link href="/Event" className="text-primary hover:underline mt-4 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    audience,
    tags,
    agenda,
    organizer,
  } = event;

  const bookings = 10;

  // Safe parsing for tags and agenda
  const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags || "[]");
  const parsedAgenda = Array.isArray(agenda) ? agenda : JSON.parse(agenda || "[]");

  return (
    <section id="event" className="p-6">
      {/* Header */}
      <div className="header flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>

        <Link
          href="/Event"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>
      </div>

      <div className="details flex flex-col md:flex-row gap-6">
        <div className="content flex-1 flex flex-col gap-4 relative">
          <div className="relative w-full h-[400px]">
            <Image
              src={imgError ? "/placeholder-event.jpg" : getImageSrc(image)}
              alt={title}
              fill
              className="banner rounded-lg object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="location" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          {parsedAgenda.length > 0 && <EventAgenda agendaItems={parsedAgenda} />}

          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          {parsedTags.length > 0 && <EventTags tags={parsedTags} />}
        </div>

        <aside className="booking w-full md:w-1/3">
          <div className="signup-card p-4 border rounded-lg shadow-md sticky top-6">
               <h2 className="text-xl font-semibold mb-2">
                 Book your Spot at {title}
                </h2>
            {bookings > 0 ? (
              <p className="text-sm text-gray-600 mb-4">
                Join {bookings} people who have already booked their spot
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-4">Be first to book your spot!</p>
            )}
            <BookEvent eventTitle={title} />

          </div>
        </aside>
      </div>
    </section>
  );
};

export default EventDetailPage;