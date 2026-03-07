"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Booking, readBookings, writeBookings } from "./booking-storage";

type BookingCalendarProps = {
  role: "customer" | "manager";
};

type Booking = {
  id: string;
  dateKey: string;
  hour: number;
  title: string;
  type: "booked" | "blocked" | "requested";
};

const HOURS = Array.from({ length: 12 }, (_, idx) => idx + 8);

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00 ${suffix}`;
}

function seedBookings(today: Date): Booking[] {
  return [
    {
      id: "seed-1",
      dateKey: toDateKey(addDays(today, 1)),
      hour: 10,
      title: "Product Demo",
      type: "booked",
    },
    {
      id: "seed-2",
      dateKey: toDateKey(addDays(today, 2)),
      hour: 14,
      title: "Strategy Call",
      type: "booked",
    },
    {
      id: "seed-3",
      dateKey: toDateKey(addDays(today, 3)),
      hour: 12,
      title: "Maintenance Window",
      type: "blocked",
    },
  ];
}

export default function BookingCalendar({ role }: BookingCalendarProps) {
  const isCustomer = role === "customer";
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewStart, setViewStart] = useState(today);
  const [bookings, setBookings] = useState<Booking[]>(seedBookings(today));

  const visibleDays = useMemo(
    () => Array.from({ length: 7 }, (_, idx) => addDays(viewStart, idx)),
    [viewStart],
  );

  function goPrev() {
    if (isCustomer) return;
    setViewStart((prev) => addDays(prev, -7));
  }

  function goNext() {
    setViewStart((prev) => addDays(prev, 7));
  }

  function goToday() {
    setViewStart(today);
  }

  function selectSlot(date: Date, hour: number) {
    if (isCustomer && startOfDay(date) < today) return;

    const dateKey = toDateKey(date);
    const existing = bookings.find((item) => item.dateKey === dateKey && item.hour === hour);
    if (existing) return;

    setBookings((prev) => [
      ...prev,
      {
        id: `${role}-${dateKey}-${hour}`,
        dateKey,
        hour,
        title: isCustomer ? "Booking request" : "Blocked slot",
        type: isCustomer ? "requested" : "blocked",
      },
    ]);
  }

  function bookingClass(type: Booking["type"]) {
    if (type === "booked") return "bg-primary/15 text-primary";
    if (type === "requested") return "bg-green-light-6 text-green-dark";
    return "bg-red-light-6 text-red-dark";
  }

  return (
    <div className="w-full max-w-full rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-white">
            {isCustomer ? "Customer Booking Calendar" : "Booking Management Calendar"}
          </h2>
          <p className="text-sm text-dark-5 dark:text-dark-6">
            {isCustomer
              ? "Choose an available future slot. Past dates are locked."
              : "Manage bookings and block time slots for your availability."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={isCustomer}
            className="rounded-md border border-stroke bg-white px-3 py-1.5 text-sm font-medium text-dark disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:bg-dark dark:text-white"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-md border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-white"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-md border border-stroke bg-white px-3 py-1.5 text-sm font-medium text-dark dark:border-dark-3 dark:bg-dark dark:text-white"
          >
            Next
          </button>
        </div>
      </div>

      <div className="calendar-theme overflow-x-auto rounded-lg border border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
        <div className="grid min-w-[920px] grid-cols-8">
          <div className="border-b border-stroke p-3 text-xs font-bold uppercase text-dark-5 dark:border-dark-3 dark:text-dark-6">
            Time
          </div>
          {visibleDays.map((day) => (
            <div
              key={toDateKey(day)}
              className="border-b border-l border-stroke p-3 text-sm font-bold text-dark dark:border-dark-3 dark:text-white"
            >
              {formatDateLabel(day)}
            </div>
          ))}

          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div className="border-b border-stroke p-3 text-xs font-medium text-dark-5 dark:border-dark-3 dark:text-dark-6">
                {formatHour(hour)}
              </div>
              {visibleDays.map((day) => {
                const dateKey = toDateKey(day);
                const booking = bookings.find((item) => item.dateKey === dateKey && item.hour === hour);

                return (
                  <button
                    key={`${dateKey}-${hour}`}
                    type="button"
                    onClick={() => selectSlot(day, hour)}
                    disabled={Boolean(booking)}
                    className="calendar-slot min-h-18 border-b border-l border-stroke p-2 text-left transition disabled:cursor-not-allowed disabled:hover:bg-transparent dark:border-dark-3"
                  >
                    {booking ? (
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${bookingClass(booking.type)}`}
                      >
                        {booking.title}
                      </span>
                    ) : (
                      <span className="text-xs text-dark-5 dark:text-dark-6">Available</span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
