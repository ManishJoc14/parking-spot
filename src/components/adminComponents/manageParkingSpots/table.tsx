import Image from "next/image";
import {
  UpdateParkingSpot,
  DeleteParkingSpot,
} from "@/components/adminComponents/manageParkingSpots/buttons";
import { formatCurrency } from "@/lib/utils";
import { AdminParkingSpot } from "@/types/definitions";
import { v4 as uuidv4 } from "uuid";

export default function ParkingSpotsTable({
  data,
}: {
  data: AdminParkingSpot[];
}) {
  const headers = [
    { key: "name", label: "Parking Spot" },
    { key: "ratePerHour", label: "Rate/hr" },
    { key: "ratePerDay", label: "Rate/day" },
    { key: "address", label: "Address" },
  ];

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {data?.map((spot) => (
              <div
                key={uuidv4()}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 w-full flex items-center gap-3">
                      {spot.coverImage && spot.coverImage.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL!) ? (
                        <div className="relative h-7 w-7">
                          <Image
                            src={spot.coverImage}
                            className="rounded-full"
                            fill
                            alt={`Parking spot ${spot.name}`}
                          />
                        </div>
                      ) : (
                        <div className="h-7 w-7 aspect-square text-xs rounded-full bg-gray-200 flex justify-center items-center">
                          {spot.name
                            .split(" ")
                            .map((n) => n.charAt(0).toUpperCase())
                            .join("")}
                        </div>
                      )}
                      <p className="ml-2">{spot.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Rate (Per Hour):{" "}
                      {formatCurrency(parseFloat(spot.ratePerHour))} | Rate (Per
                      Day): {formatCurrency(parseFloat(spot.ratePerDay))}
                    </p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm">
                      Address: {spot.address}, {spot.postcode}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateParkingSpot id={spot.id} />
                    <DeleteParkingSpot id={spot.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table View */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                {headers.map((header) => (
                  <th
                    key={uuidv4()}
                    scope="col"
                    className="px-4 py-5 font-mont-semibold sm:pl-6"
                  >
                    {header.label}
                  </th>
                ))}
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white font-mont-medium">
              {data?.map((spot) => (
                <tr
                  key={uuidv4()}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex w-full items-center gap-3">
                      {spot.coverImage && spot.coverImage.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL!) ? (
                        <div className="relative h-7 w-7">
                          <Image
                            src={spot.coverImage}
                            className="rounded-full"
                            fill
                            alt={`Parking spot ${spot.name}`}
                          />
                        </div>
                      ) : (

                        <div className="h-7 w-7 aspect-square text-xs rounded-full bg-gray-200 flex justify-center items-center">
                          {spot.name
                            .split(" ")
                            .map((n) => n.charAt(0).toUpperCase())
                            .join("")}
                        </div>
                      )}
                      <p className="ml-2">{spot.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(parseFloat(spot.ratePerHour))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(parseFloat(spot.ratePerDay))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {spot.address}, {spot.postcode}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateParkingSpot id={spot.id} />
                      <DeleteParkingSpot id={spot.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}
