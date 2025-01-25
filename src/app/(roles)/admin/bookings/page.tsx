import BookingsPage from "@/components/adminComponents/Bookings/bookingsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Page() {
  return (
    <main>
      <BookingsPage />
    </main>
  );
}
