'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Timeline from "./components/Timeline"

interface Calendar {
  id: string;
  summary: string;
}

export default function Home() {
  const { data: session } = useSession()
  const [calendarList, setCalendarList] = useState<Calendar[]>([])
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0])
  const [duration, setDuration] = useState(30)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calendarData, setCalendarData] = useState(null)

  useEffect(() => {
    const fetchCalendars = async () => {
      if (session) {
        try {
          const response = await fetch('/api/calendars');
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch calendars');
          }
          setCalendarList(data.calendars || []);
        } catch (err: any) {
          setError(err.message);
        }
      }
    };
    fetchCalendars();
  }, [session]);

  const handleCalendarSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedCalendars(prev => 
      checked ? [...prev, value] : prev.filter(id => id !== value)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuggestions([])
    setCalendarData(null)

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendees: selectedCalendars.join(','), startDate, endDate, duration }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setSuggestions(data.suggestions)
      setCalendarData(data.calendarData)

      if (data.suggestions.length === 0) {
        setError('No available slots found, but you can see the schedules below.')
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="row-start-1 self-start w-full">
        <h1 className="text-2xl font-bold text-center">Google Calendar Suggester</h1>
        <div className="absolute top-5 right-5">
          {session ? (
            <div className="flex items-center gap-4">
              <p>{session.user?.name}</p>
              <p>{session.user?.email}</p>
              <button 
                onClick={() => signOut()} 
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn('google')} 
              className="rounded-full bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-5"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl">
        {session ? (
          <div className="w-full">
            <h2 className="text-xl font-semibold text-center mb-4">Find available time</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-black/[.05] dark:bg-white/[.06] p-6 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Select Attendees</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white dark:bg-black/[.2] rounded">
                  {calendarList.map(cal => (
                    <label key={cal.id} className="flex items-center space-x-2 p-1 rounded hover:bg-black/[.05] dark:hover:bg-white/[.06]">
                      <input
                        type="checkbox"
                        value={cal.id}
                        onChange={handleCalendarSelection}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm truncate" title={cal.summary}>{cal.summary}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 rounded bg-white dark:bg-black/[.2] border border-solid border-black/[.08] dark:border-white/[.145]"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 rounded bg-white dark:bg-black/[.2] border border-solid border-black/[.08] dark:border-white/[.145]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full p-2 rounded bg-white dark:bg-black/[.2] border border-solid border-black/[.08] dark:border-white/[.145]"
                  min="15"
                  step="15"
                />
              </div>
              <button type="submit" disabled={loading} className="rounded-full bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-5 disabled:bg-gray-400">
                {loading ? 'Searching...' : 'Find Times'}
              </button>
            </form>
            
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            
            {suggestions.length > 0 && (
              <div className="mt-6 w-full">
                <h3 className="text-lg font-semibold mb-2 text-center">Suggested Times:</h3>
                <ul className="list-disc list-inside bg-black/[.05] dark:bg-white/[.06] p-4 rounded-lg">
                  {suggestions.map((slot, index) => <li key={index}>{slot}</li>)}
                </ul>
              </div>
            )}

            {calendarData && (
              <div className="mt-6 w-full">
                 <h3 className="text-lg font-semibold mb-2 text-center">Calendars Visualization</h3>
                <Timeline calendarData={calendarData} startDate={startDate} endDate={endDate} />
              </div>
            )}
          </div>
        ) : (
          <p className="text-center">Please sign in to use the scheduler.</p>
        )}
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  )
}
