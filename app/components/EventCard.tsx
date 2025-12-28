import Image from "next/image";

interface Props {
  title: string;
  image: string;
  date?: string;
  location?: string;
  time?: string;
}

const EventCard = ({ title, image, date, location, time }: Props) => {
  return (
    <div className="flex flex-col gap-3 bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg">
      
      {/* Event Poster */}
      <div className="relative w-full h-[300px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority // disables lazy loading for main poster
        />
      </div>

      {/* Event Info */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-[20px] font-semibold line-clamp-1">{title}</h3>

        {/* Event details row */}
        <div className="flex flex-wrap items-center gap-4 text-light-200 text-sm mt-1">
          
          {/* Date */}
          {date && (
            <div className="flex items-center gap-1">
              <Image
                src="/icons/calendar.svg"
                alt="Event Date Icon"
                width={16}
                height={16}
              />
              <span>{date}</span>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1">
              <Image
                src="/icons/audience.svg"
                alt="Event Location Icon"
                width={16}
                height={16}
              />
              <span>{location}</span>
            </div>
          )}

          {/* Time */}
          {time && (
            <div className="flex items-center gap-1">
              <Image
                src="/icons/clock.svg"
                alt="Event Time Icon"
                width={16}
                height={16}
              />
              <span>{time}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EventCard;
