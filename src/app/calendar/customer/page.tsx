import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import BookingCalendar from "@/components/CalenderBox/booking-calendar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Booking Calendar",
};

const CustomerCalendarPage = () => {
  return (
    <>
      <Breadcrumb pageName="Customer Booking" />
      <BookingCalendar role="customer" />
    </>
  );
};

export default CustomerCalendarPage;
