'use client';
import { useState } from "react";

const BookEvent = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
   // Optional: show loading state here if you want
  // setLoading(true);

  // Simulate API call delay
  setTimeout(() => {
    setSubmitted(true); // Show "Thank you" message
    // setLoading(false); // Stop loading if you used it
  }, 1000);
    
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
              required
              className="border p-2 rounded"
            />
          </div>

          <button type="submit" className="button-submit mt-2">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;