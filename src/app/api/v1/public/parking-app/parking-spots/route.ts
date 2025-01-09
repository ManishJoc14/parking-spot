import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToCamelCase } from "@/lib/utils";

export async function GET(req: Request) {
  const supabase = await createClient();

  // Extract query parameters for pagination
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "5");
  const latitude = parseFloat(searchParams.get("latitude") || "0");
  const longitude = parseFloat(searchParams.get("longitude") || "0");

  const ordering = searchParams.get("ordering") || "rate_per_hour"; // Default ordering

  // Check if ordering is ascending or descending
  const orderingtype =
    searchParams.get("ordering")?.charAt(0) === "-"
      ? { ascending: false }
      : { ascending: true };

  // Fetch the total count of parking spots
  const { count, error: countError } = await supabase
    .from("parking_spots")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (!count) {
    return NextResponse.json(
      {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      { status: 200 }
    );
  }

  // Fetch parking spot data with pagination and ordering
  const { data, error } = await supabase
    .from("parking_spots")
    .select(
      "uuid, name, cover_image, description, address, rate_per_hour, rate_per_day, latitude, longitude, total_reviews, postcode, average_rating"
    )
    .order(ordering, orderingtype) // Sorting
    .range(offset, offset + limit - 1); // Pagination

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert keys to camelCase
  const results = convertObjectKeysToCamelCase(data);

  // Calculate pagination URLs
  const nextOffset = offset + limit < count ? offset + limit : null;
  const previousOffset = offset - limit >= 0 ? offset - limit : null;

  const res = {
    count, // Total count of parking spots
    // pagination URLs
    next:
      nextOffset !== null
        ? `/api/v1/public/parking-app/parking-spots?latitude=${latitude}&longitude=${longitude}&ordering=${ordering}&limit=${limit}&offset=${nextOffset}`
        : null,
    previous:
      previousOffset !== null
        ? `/api/v1/public/parking-app/parking-spots?latitude=${latitude}&longitude=${longitude}&ordering=${ordering}&limit=${limit}&offset=${previousOffset}`
        : null,
    results,
  };

  return NextResponse.json(res, { status: 200 });
}
