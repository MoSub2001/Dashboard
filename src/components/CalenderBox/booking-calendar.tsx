"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Booking, readBookings, writeBookings } from "./booking-storage";

type BookingCalendarProps = {
  role: "customer" | "manager";
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

type PendingSelection = {
  date: Date;
  hour: number;
};

export default function BookingCalendar({ role }: BookingCalendarProps) {
  const router = useRouter();
  const isCustomer = role === "customer";
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewStart, setViewStart] = useState(today);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);

  useEffect(() => {
    setBookings(readBookings());

    function onStorage(event: StorageEvent) {
      if (!event.key || event.key.includes("dashboard-bookings")) {
        setBookings(readBookings());
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const visibleDays = useMemo(
    () => Array.from({ length: 7 }, (_, idx) => addDays(viewStart, idx)),
    [viewStart],
  );

  function saveBookings(nextBookings: Booking[]) {
    setBookings(nextBookings);
    writeBookings(nextBookings);
  }

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

    if (isCustomer) {
      setPendingSelection({ date, hour });
      return;
    }

    const nextBookings = [
      ...bookings,
      {
        id: `manager-${dateKey}-${hour}`,
        dateKey,
        hour,
        title: "Blocked slot",
        type: "blocked",
      } as Booking,
    ];

    saveBookings(nextBookings);
  }

  function confirmCustomerBooking() {
    if (!pendingSelection) return;

    const dateKey = toDateKey(pendingSelection.date);
    const nextBookings = [
      ...bookings,
      {
        id: `customer-${dateKey}-${pendingSelection.hour}`,
        dateKey,
        hour: pendingSelection.hour,
        title: "Customer Booking",
        type: "booked",
      } as Booking,
    ];

    saveBookings(nextBookings);
    setPendingSelection(null);

    router.push(
      `/calendar/customer/confirmation?date=${dateKey}&hour=${pendingSelection.hour}&name=Sarah%20Johnson`,
    );
  }

  function bookingClass(type: Booking["type"]) {
    if (type === "booked") return "bg-primary/15 text-primary";
    return "bg-red-light-6 text-red-dark";
  }

  return (
    <>
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

      {pendingSelection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-2 text-lg font-bold text-dark dark:text-white">Confirm booking</h3>
            <p className="mb-5 text-sm text-dark-5 dark:text-dark-6">
              Book {formatDateLabel(pendingSelection.date)} at {formatHour(pendingSelection.hour)}?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingSelection(null)}
                className="rounded-md border border-stroke px-3 py-1.5 text-sm font-medium text-dark dark:border-dark-3 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCustomerBooking}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
