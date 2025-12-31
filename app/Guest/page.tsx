'use client'

import { useState, useEffect } from 'react';
import { Mail, Send, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  eventSlug: string;
}

interface Guest {
  email: string;
  name?: string;
}

export default function SendEmailPage({ eventSlug }: Props) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
  const [errors, setErrors] = useState<{ recipients?: string; subject?: string; html?: string }>({});

  useEffect(() => {
    fetchGuests();
  }, [eventSlug]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/guest-emails?eventSlug=${eventSlug}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setGuests(data);
      setMessage({ type: '', text: '' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to fetch guest emails.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setRecipients(selected);
    if (selected.length > 0) {
      setErrors(prev => ({ ...prev, recipients: undefined }));
    }
  };

  const selectAll = () => {
    setRecipients(guests.map((g) => g.email).filter(Boolean));
    setErrors(prev => ({ ...prev, recipients: undefined }));
  };

  const deselectAll = () => setRecipients([]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (recipients.length === 0) {
      newErrors.recipients = 'Please select at least one recipient';
    }
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!html.trim()) {
      newErrors.html = 'Message content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSending(true);
      setMessage({ type: '', text: '' });
      
      const res = await fetch('http://localhost:8000/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients,
          subject,
          html,
        }),
      });

      if (!res.ok) throw new Error('Failed to send');
      
      setMessage({ type: 'success', text: `Email sent successfully to ${recipients.length} recipient(s)!` });
      setRecipients([]);
      setSubject('');
      setHtml('');
      setErrors({});
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to send email. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-300">Loading guests...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-gray-900 rounded-lg shadow-2xl border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Send Email</h1>
          <p className="text-gray-400 text-sm">Event: {eventSlug}</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-200' : 'text-red-200'}`}>
            {message.text}
          </p>
        </div>
      )}

      <div onSubmit={handleSubmit} className="space-y-6">
        {/* Recipients Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-white font-medium flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Recipients ({recipients.length} selected)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          
          <select
            multiple
            value={recipients}
            onChange={handleRecipientsChange}
            className={`w-full border p-3 rounded-lg h-40 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
              errors.recipients ? 'border-red-500' : 'border-gray-700'
            }`}
          >
            {guests.length === 0 ? (
              <option disabled className="text-gray-500">No guests found for this event</option>
            ) : (
              guests.map((g, index) => {
                const key = g.email ?? `guest-${index}`;
                return (
                  <option 
                    key={key} 
                    value={g.email}
                    className="py-2 hover:bg-gray-700"
                  >
                    {g.name ? `${g.name} <${g.email}>` : g.email}
                  </option>
                );
              })
            )}
          </select>
          {errors.recipients && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.recipients}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple recipients</p>
        </div>

        {/* Subject */}
        <div>
          <label className="text-white font-medium block mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (e.target.value.trim()) {
                setErrors(prev => ({ ...prev, subject: undefined }));
              }
            }}
            className={`w-full border p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
              errors.subject ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="Enter email subject"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.subject}
            </p>
          )}
        </div>

        {/* HTML Message */}
        <div>
          <label className="text-white font-medium block mb-2">
            Message Content
          </label>
          <textarea
            value={html}
            onChange={(e) => {
              setHtml(e.target.value);
              if (e.target.value.trim()) {
                setErrors(prev => ({ ...prev, html: undefined }));
              }
            }}
            className={`w-full border p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm ${
              errors.html ? 'border-red-500' : 'border-gray-700'
            }`}
            rows={10}
            placeholder="Write your message in HTML or plain text&#10;&#10;Example:&#10;<h1>Hello!</h1>&#10;<p>Thank you for registering.</p>"
          />
          {errors.html && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.html}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">Supports HTML formatting</p>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={sending || guests.length === 0}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Email
            </>
          )}
        </button>
      </div>
    </div>
  );
}