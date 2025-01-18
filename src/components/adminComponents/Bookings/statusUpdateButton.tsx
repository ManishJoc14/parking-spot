"use client";

import { useEffect, useState } from "react";
import { Booking, BookingStatus } from "@/types/definitions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axiosInstance";
import { getBookingKey } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { SmallLoadingSpinner } from "@/components/ui/loading-spinner";

export default function StatusUpdateButton({
  booking,
  fetchBookings,
  user_uuid,
}: {
  booking: Booking;
  fetchBookings: (url: string) => void;
  user_uuid: string;
}) {
  const [status, setStatus] = useState(booking.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await axiosInstance.put(
        `/admin/parking-spot-app/bookings/${booking.id}/update-status`,
        { status: newStatus, parking_spot: booking.parkingSpot },
        {
          headers: {
            user_uuid
          },
        }
      );
      setStatus(newStatus as BookingStatus);
      fetchBookings("/admin/parking-spot-app/bookings?limit=4");
    } catch (error) {
      console.log("Error updating booking status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      value={getBookingKey(status)}
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[145px]">
        <SelectValue placeholder="Update status" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(BookingStatus).map((statusOption) => (
          <SelectItem
            key={uuidv4()}
            value={statusOption as keyof typeof BookingStatus}
          >
            {BookingStatus[statusOption as keyof typeof BookingStatus]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
