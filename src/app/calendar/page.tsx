import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CalendarBox from "@/components/CalenderBox";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Management Calendar",
};

const CalendarPage = () => {
  return (
    <>
      <Breadcrumb pageName="Booking Management" />

      <CalendarBox />
    </>
  );
};

export default CalendarPage;
