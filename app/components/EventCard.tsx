'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
  title: string;
  image?: string | null;
  slug: string;
  date?: string;
  location?: string;
  time?: string;
}

const BACKEND_URL = 'http://localhost:8000';

const EventCard = ({ title, image, slug, date, location, time }: Props) => {
  const [imgError, setImgError] = useState(false);

  // ✅ Return safe URL for Next.js Image
  const getImageSrc = () => {
    if (imgError) return '/placeholder-event.jpg';
    if (!image || image.trim() === '') return '/placeholder-event.jpg';

    // Already absolute URL
    if (image.startsWith('http')) return image;

    // Relative URL from backend
    if (image.startsWith('/')) return `${BACKEND_URL}${image}`;

    // Fallback
    return '/placeholder-event.jpg';
  };

  return (
    <Link href={`/event/${slug}`} className="block">
      <div className="flex flex-col gap-3 bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer">

        {/* Event Poster */}
        <div className="relative w-full h-[300px] bg-gray-200">
          <Image
            src={getImageSrc()}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized // ✅ Dev-only: bypass Next.js optimizer for localhost
          />
        </div>

        {/* Event Info */}
        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-[20px] font-semibold line-clamp-1">{title}</h3>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {date && <span>{date}</span>}
            {location && <span>{location}</span>}
            {time && <span>{time}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
