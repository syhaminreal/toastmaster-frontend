'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Download, Calendar, Mail, Filter, ArrowUpDown } from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

interface Guest {
  id: string;
  email: string;
  eventId: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    slug: string;
  };
}

type SortField = 'email' | 'event' | 'date';
type SortOrder = 'asc' | 'desc';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setError(null);
      const res = await fetch(`${BACKEND_URL}/guest-emails/with-event`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const guestsData = data.data;
      if (!Array.isArray(guestsData)) throw new Error('Invalid data format received');
      setGuests(guestsData);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setError('Failed to load guests. Please try again.');
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  // Build unique events with id and title to ensure unique keys
  const uniqueEvents = useMemo(() => {
    const map = new Map<string, string>(); // eventId -> title
    guests.forEach((g) => {
      const id = g.event?.id || g.eventId;
      const title = g.event?.title || g.eventId;
      if (!map.has(id)) map.set(id, title);
    });
    return Array.from(map.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [guests]);

  const filteredAndSortedGuests = useMemo(() => {
    let filtered = guests.filter((guest) => {
      const eventTitle = guest.event?.title || guest.eventId || '';
      const email = guest.email || '';

      const matchesSearch =
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eventTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEvent = selectedEvent === 'all' || eventTitle === selectedEvent;

      return matchesSearch && matchesEvent;
    });

    filtered.sort((a, b) => {
      let compareResult = 0;
      switch (sortField) {
        case 'email':
          compareResult = a.email.localeCompare(b.email);
          break;
        case 'event':
          const eventA = a.event?.title || a.eventId;
          const eventB = b.event?.title || b.eventId;
          compareResult = eventA.localeCompare(eventB);
          break;
        case 'date':
          compareResult = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [guests, searchTerm, selectedEvent, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Event', 'Registration Date'];
    const rows = filteredAndSortedGuests.map((guest) => [
      guest.email,
      guest.event?.title || guest.eventId,
      new Date(guest.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={fetchGuests}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Guest Signups
            <span className="ml-3 text-lg font-normal text-gray-500">
              ({filteredAndSortedGuests.length} {filteredAndSortedGuests.length === 1 ? 'guest' : 'guests'})
            </span>
          </h1>

          {guests.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {guests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Mail className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 text-lg">No guests found.</p>
            <p className="text-gray-500 text-sm mt-2">Guest signups will appear here once people register.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by email or event..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Event Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Events</option>
                    {uniqueEvents.map((event) => (
                      <option key={event.id} value={event.title}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSort('date')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                      sortField === 'date'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Date
                    {sortField === 'date' && <ArrowUpDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleSort('email')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                      sortField === 'email'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                    {sortField === 'email' && <ArrowUpDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Guest List */}
            {filteredAndSortedGuests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600">No guests match your search criteria.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAndSortedGuests.map((guest, index) => (
                  <div
                    key={guest.id || `${guest.eventId}-${index}`}
                    className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                            {guest.event?.title || guest.eventId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 mb-1">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium truncate">{guest.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {new Date(guest.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
