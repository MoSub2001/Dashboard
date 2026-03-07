"use client";

import React, { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { subMonths } from "date-fns";

type Holiday = {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
};

type CalEvent = {
  id: string;
  title: string;
  start: string; // ISO or YYYY-MM-DD for allDay
  allDay?: boolean;
};

async function fetchHolidays(year: number, countryCode: string): Promise<Holiday[]> {
  // Free API, no key required
  const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load holidays (${res.status})`);
  return res.json();
}

function holidaysToEvents(holidays: Holiday[]): CalEvent[] {
  return holidays.map((h) => ({
    id: `${h.date}-${h.name}`,
    title: h.localName || h.name,
    start: h.date,
    allDay: true,
  }));
}

export default function CalendarBox() {
  // FullCalendar ref
  const calendarRef = useRef<FullCalendar | null>(null);

  const today = useMemo(() => new Date(), []);
  const minBackDate = useMemo(() => subMonths(today, 1), [today]);

  // Pick a default; change to "IL" if you want Israel by default
  const [countryCode, setCountryCode] = useState<"US" | "GB" | "DE" | "FR" | "IL">("US");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loadedYears, setLoadedYears] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ensureYearLoaded(year: number) {
    if (loadedYears.has(year)) return;

    setLoading(true);
    setError(null);

    try {
      const holidays = await fetchHolidays(year, countryCode);
      const newEvents = holidaysToEvents(holidays);

      setEvents((prev) => {
        const existing = new Set(prev.map((e) => e.id));
        return [...prev, ...newEvents.filter((e) => !existing.has(e.id))];
      });

      setLoadedYears((prev) => new Set([...prev, year]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  function clampBackNavigation(viewStart: Date) {
    if (viewStart < minBackDate) {
      const api = calendarRef.current?.getApi();
      if (!api) return;
      api.gotoDate(minBackDate);
    }
  }

  return (
    <div className="w-full max-w-full rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Top bar */}
     

      {/* Status */}
      {(loading || error) && (
        <div className="px-4 pt-3">
          {loading && <div className="text-sm text-body dark:text-bodydark">Loading events…</div>}
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        </div>
      )}

      {/* Calendar */}
      <div className="p-4">
        <FullCalendar
          ref={(node) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            calendarRef.current = node as any;
          }}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          height="auto"
          nowIndicator
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek",
          }}
          eventDisplay="block"
          events={events}
          datesSet={(arg) => {
            clampBackNavigation(arg.view.currentStart);

            // Load any years that this visible range touches
            const startYear = arg.view.currentStart.getFullYear();
            const endYear = arg.view.currentEnd.getFullYear();
            void ensureYearLoaded(startYear);
            if (endYear !== startYear) void ensureYearLoaded(endYear);
          }}
        />
      </div>
    </div>
  );
}