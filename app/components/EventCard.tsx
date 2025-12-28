import Image from "next/image";

interface Props {
  title: string;
  image: string;
  date: string;
  location: string;
}

const EventCard = ({ title, image, date, location }: Props) => {
 
 
 
  return (
    <div id="event-card" className="flex flex-col gap-3 bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg">
      {/* Event Poster */}
      <Image
        src={image}
        alt={title}
        width={410}
        height={300}
        className="poster w-full h-[300px] object-cover"
      />

      {/* Event Info */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="title text-[20px] font-semibold line-clamp-1">{title}</h3>

        {/* Event details row */}
        <div className="datetime flex flex-row flex-wrap items-center gap-4 text-light-200 text-sm mt-1">
          {/* Date */}
          <div className="flex items-center gap-1">
            <Image src="/icons/calendar.svg" alt="Date" width={16} height={16} />
            <span>{date}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1">
            <Image src="/icons/audience.svg" alt="Location" width={16} height={16} />
            <span>{location}</span>
          </div>

          {/* Optional Time */}
          <div className="flex items-center gap-1">
            <Image src="/icons/clock.svg" alt="Time" width={16} height={16} />
            <span>10:00 AM</span> {/* Placeholder time */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;