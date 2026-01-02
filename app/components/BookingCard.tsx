'use client';
import { useState } from "react";
import axios from 'axios';

type BookEventProps = {
  eventTitle: string; // you can also pass eventId or slug if you prefer
};

const BookEvent = ({ eventTitle }: BookEventProps) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:8000/guest-emails', { 
        email,
        event: eventTitle, // sending the event with the email
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setError('This email is already registered for this event.');
      } else {
        setError('Failed to submit email. Try again later.');
      }
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm text-green-600">
          Thank you for signing up for {eventTitle}!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              required
              className="border p-2 rounded w-full"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" className="button-submit mt-2 bg-blue-500 text-white p-2 rounded">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
