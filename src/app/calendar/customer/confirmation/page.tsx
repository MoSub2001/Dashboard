import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmed",
};

type ConfirmationPageProps = {
  searchParams: Promise<{
    date?: string;
    hour?: string;
    name?: string;
    service?: string;
    email?: string;
    phone?: string;
    loyaltyId?: string;
  }>;
};

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00 ${suffix}`;
}

export default async function CustomerConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;

  const customerName = params.name ?? "Customer";
  const date = params.date ?? "TBD";
  const hour = Number(params.hour ?? "9");
  const service = params.service ?? "Hair cut ✂️";
  const email = params.email ?? "customer@example.com";
  const phone = params.phone ?? "+1 (555) 123-4567";
  const loyaltyId = params.loyaltyId ?? "SALON-SPARK-0000";

  return (
    <>
      <Breadcrumb pageName="Booking Confirmed" />

      <div className="relative overflow-hidden rounded-[14px] border border-stroke bg-white p-6 font-sans shadow-3 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10" />
        <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-green-light-4/40" />

        <div className="relative">
          <p className="mb-3 inline-flex rounded-full bg-green-light-6 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-green-dark">
            Reservation complete
          </p>
          <h1 className="mb-2 text-3xl font-black text-dark dark:text-white">
            You are all set, {customerName}! 🥳
          </h1>
          <p className="mb-6 text-sm text-dark-5 dark:text-dark-6">
            Your appointment is confirmed. Get ready to look fabulous — we saved
            your sparkle slot.
          </p>

          <div className="grid gap-4 rounded-2xl border border-stroke bg-gray-1 p-5 dark:border-dark-3 dark:bg-dark-2 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-dark-5 dark:text-dark-6">
                Service
              </p>
              <p className="mt-1 text-lg font-bold text-primary">{service}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-dark-5 dark:text-dark-6">
                Time
              </p>
              <p className="mt-1 text-lg font-bold text-dark dark:text-white">
                {formatHour(hour)}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase text-dark-5 dark:text-dark-6">
                Date
              </p>
              <p className="mt-1 text-lg font-bold text-dark dark:text-white">
                {date}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
              Customer details (demo)
            </h2>
            <div className="grid gap-2 text-sm text-dark-5 dark:text-dark-6 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-dark dark:text-white">
                  Email:
                </span>{" "}
                {email}
              </p>
              <p>
                <span className="font-semibold text-dark dark:text-white">
                  Phone:
                </span>{" "}
                {phone}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold text-dark dark:text-white">
                  Loyalty ID:
                </span>{" "}
                {loyaltyId}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/calendar/customer"
              className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Book another slot
            </Link>
            <Link
              href="/calendar"
              className="rounded-md border border-stroke bg-white px-4 py-2 text-sm font-medium text-dark transition hover:bg-gray-1 dark:border-dark-3 dark:bg-dark dark:text-white"
            >
              Open manager calendar
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
