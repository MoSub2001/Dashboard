export type BookingType = "booked" | "blocked" | "requested";

export type Booking = {
  id: string;
  dateKey: string;
  hour: number;
  title: string;
  type: BookingType;
};

const BOOKING_STORAGE_KEY = "dashboard-bookings";

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

export function getSeedBookings() {
  const today = startOfDay(new Date());

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
  ] satisfies Booking[];
}

export function readBookings() {
  if (typeof window === "undefined") return getSeedBookings();

  const raw = window.localStorage.getItem(BOOKING_STORAGE_KEY);
  if (!raw) {
    const seed = getSeedBookings();
    window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as Booking[];
    return parsed;
  } catch {
    const seed = getSeedBookings();
    window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

export function writeBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
}
