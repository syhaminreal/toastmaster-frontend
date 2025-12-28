import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "../../components/BookingCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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

/* ---------------- Event Detail Page ---------------- */
const EventDetailpage = async ({ params }: { params: { slug: string } | Promise<{ slug: string }> }) => {
  const resolvedParams = await params as { slug: string };
  const { slug } = resolvedParams;

  const res = await fetch(`${BASE_URL}/api/events/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const data = await res.json();
  const { event } = data;

  if (!event) return notFound();

  const {
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


  const bookings=10
  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />

          <section className="flex flex-col gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2>Event Details</h2>

            <EventDetailItem icon="/icon/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icon/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icon/pin.svg" alt="location" label={location} />
            <EventDetailItem icon="/icon/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icon/audience.svg" alt="audience" label={audience} />
          </section>

          {/* Agenda */}
          <EventAgenda
            agendaItems={Array.isArray(agenda) ? agenda : JSON.parse(agenda[0])}
          />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags
            tags={Array.isArray(tags) ? tags : JSON.parse(tags[0])}
          />
        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2> Book your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have alredy booked their spot
              </p>
            
            ): (
              <p className="text-sm"> Be first to book your spot!</p>
            )}
            <BookEvent/>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default EventDetailpage;