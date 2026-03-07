import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmed",
};

type ConfirmationPageProps = {
  searchParams: Promise<{ date?: string; hour?: string; name?: string }>;
};

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00 ${suffix}`;
}

export default async function CustomerConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;

  const customerName = params.name ?? "Customer";
  const date = params.date ?? "TBD";
  const hour = Number(params.hour ?? "9");

  return (
    <>
      <Breadcrumb pageName="Booking Confirmed" />

      <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <h1 className="mb-3 text-2xl font-bold text-dark dark:text-white">Thanks, {customerName}!</h1>
        <p className="mb-1 text-dark-5 dark:text-dark-6">Your booking has been confirmed.</p>
        <p className="mb-6 text-dark dark:text-white">
          Slot: <span className="font-semibold">{date}</span> at <span className="font-semibold">{formatHour(hour)}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/calendar/customer"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Back to customer calendar
          </Link>
          <Link
            href="/calendar"
            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-dark dark:border-dark-3 dark:text-white"
          >
            View manager calendar
          </Link>
        </div>
      </div>
    </>
  );
}
