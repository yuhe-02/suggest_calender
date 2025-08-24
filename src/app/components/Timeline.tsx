'use client'

import React from 'react';

// Define the types for the props
interface BusySlot {
  start: string;
  end: string;
}

interface Calendar {
  busy: BusySlot[];
}

interface CalendarData {
  [email: string]: Calendar;
}

interface TimelineProps {
  calendarData: CalendarData;
  startDate: string;
  endDate: string;
}

const Timeline: React.FC<TimelineProps> = ({ calendarData, startDate, endDate }) => {
  const startHour = 9;
  const endHour = 18; // Display up to 6 PM
  const totalHours = endHour - startHour;

  const timeToPosition = (time: Date) => {
    const hour = time.getHours() + time.getMinutes() / 60;
    if (hour < startHour || hour > endHour) return null; // Outside of display range
    return ((hour - startHour) / totalHours) * 100;
  };

  const renderDay = (date: Date) => {
    const dayLabel = date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });

    return (
      <div key={date.toISOString()} className="mb-8">
        <h3 className="text-lg font-semibold mb-2">{dayLabel}</h3>
        <div className="relative bg-black/[.05] dark:bg-white/[.06] p-4 rounded-lg">
          {/* Hour markers */}
          <div className="relative h-8 border-b border-gray-500/20">
            {Array.from({ length: totalHours }).map((_, i) => {
              const hour = startHour + i;
              return (
                <div
                  key={hour}
                  className="absolute top-0 text-xs text-gray-500"
                  style={{ left: `${(i / totalHours) * 100}%` }}
                >
                  {hour}:00
                </div>
              );
            })}
          </div>

          {/* User calendars */}
          <div className="mt-2 space-y-2">
            {Object.entries(calendarData).map(([email, data]) => (
              <div key={email} className="flex items-center">
                <div className="w-48 text-sm truncate pr-2" title={email}>{email}</div>
                <div className="relative flex-1 h-8 bg-green-500/20 rounded">
                  {data.busy.map((slot, i) => {
                    const slotStart = new Date(slot.start);
                    const slotEnd = new Date(slot.end);

                    // Check if the slot is for the current day (robustly)
                    if (slotStart.getFullYear() !== date.getFullYear() ||
                        slotStart.getMonth() !== date.getMonth() ||
                        slotStart.getDate() !== date.getDate()) {
                      return null;
                    }

                    const left = timeToPosition(slotStart);
                    const right = timeToPosition(slotEnd);

                    if (left === null || right === null) return null;

                    const width = right - left;

                    return (
                      <div
                        key={i}
                        className="absolute h-full bg-red-500/70 rounded-lg border border-red-700/50"
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`Busy: ${slotStart.toLocaleTimeString()} - ${slotEnd.toLocaleTimeString()}`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      days.push(renderDay(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  return <div>{renderDays()}</div>;
};

export default Timeline;
