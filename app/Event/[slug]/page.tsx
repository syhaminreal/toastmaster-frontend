import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import BookEvent from "../../components/BookingCard";

// 1️⃣ Define BASE_URL first
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not defined");

/* ---------------- Helper Function ---------------- */
const getImageSrc = (image: string | null | undefined): string => {
  if (!image || image.trim() === "") return "/placeholder-event.jpg";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/")) return image;
  return `/uploads/${image}`;
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
const EventDetailpage = async ({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) => {
  // ✅ Await params in Next.js 16
  const { slug } = await params;

  let event: Event;

  try {
    // ✅ Correct Axios URL
    const response = await axios.get(`${BASE_URL}/events/${slug}`);
    event = response.data.event || response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return notFound();
  }

  if (!event) return notFound();

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

  // Ensure image is a full URL
  const imageSrc = getImageSrc(image);

  return (
    <section id="event" className="p-6">
      {/* Header with Edit Button */}
      <div className="header flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>

        {/* Edit Button */}
        <Link
          href={`/Event/${slug}/update`}
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Event
        </Link>
      </div>

      <div className="details flex flex-col md:flex-row gap-6">
        <div className="content flex-1 flex flex-col gap-4">
          <Image
            src={imageSrc}
            alt="Event Banner"
            width={800}
            height={400}
            className="banner rounded-lg object-cover"
          />

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

          {/* Agenda */}
          {parsedAgenda.length > 0 && <EventAgenda agendaItems={parsedAgenda} />}

          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          {parsedTags.length > 0 && <EventTags tags={parsedTags} />}
        </div>

        <aside className="booking w-full md:w-1/3">
          <div className="signup-card p-4 border rounded-lg shadow-md sticky top-6">
            <h2 className="text-xl font-semibold mb-2">Book your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm text-gray-600 mb-4">
                Join {bookings} people who have already booked their spot
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-4">Be first to book your spot!</p>
            )}
            <BookEvent />
          </div>
        </aside>
      </div>
    </section>
  );
};

export default EventDetailpage;
