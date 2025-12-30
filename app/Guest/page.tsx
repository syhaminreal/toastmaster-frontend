'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
  eventSlug: string; // Pass the current event slug as a prop
}

export default function SendEmailPage({ eventSlug }: Props) {
  const [guests, setGuests] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [message, setMessage] = useState('');

  // Fetch guest emails for this event
  useEffect(() => {
    axios.get(`http://localhost:8000/guest-emails?eventSlug=${eventSlug}`)
      .then(res => {
        const emails = res.data.map((g: any) => g.email);
        setGuests(emails);
      })
      .catch(err => console.error(err));
  }, [eventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recipients.length === 0) {
      setMessage('Please select at least one recipient.');
      return;
    }

    try {
      await axios.post('http://localhost:8000/mail/send', {
        recipients,
        subject,
        html,
      });
      setMessage('Email sent successfully!');
      setRecipients([]);
      setSubject('');
      setHtml('');
    } catch (err) {
      console.error(err);
      setMessage('Failed to send email.');
    }
  };

  const handleRecipientsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setRecipients(selected);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Send Email</h1>
      {message && <p className="mb-4 text-sm">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>Recipients (select multiple)</label>
        <select
          multiple
          value={recipients}
          onChange={handleRecipientsChange}
          className="border p-2 rounded"
        >
          {guests.map(email => (
            <option key={email} value={email}>{email}</option>
          ))}
        </select>

        <label>Subject</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="border p-2 rounded"
        />

        <label>HTML Message</label>
        <textarea
          value={html}
          onChange={e => setHtml(e.target.value)}
          className="border p-2 rounded"
          rows={6}
        ></textarea>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Send Email</button>
      </form>
    </div>
  );
}
