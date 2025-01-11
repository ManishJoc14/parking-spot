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

  // Default ordering rate_per_hour ascending
  // ordering variable is used for using in the next and previous of response 
  let ordering = searchParams.get("ordering") || "rate_per_hour";

  // NOTE -- we can sort by 
  //   | "rate_per_hour"
  //   | "-rate_per_hour"
  //   | "average_rating"
  //   | "-average_rating"
  //   | "distance"
  //   | "-distance";

  // Check if ordering is ascending or descending
  const isDescending = ordering.startsWith("-");

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
  let { data, error } = await supabase
    .from("parking_spots")
    .select(`
        id, uuid, name, cover_image, description, address, rate_per_hour, rate_per_day, latitude, longitude, postcode, average_rating,
        reviews:parking_spot_reviews (
          id, rating
          )
          `)
    .order(
      isDescending ? ordering.slice(1) : ordering, // remove "-" from column name if present in descending order
      { ascending: !isDescending }) // Sorting
    .range(offset, offset + limit - 1); // Pagination 

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
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

  // Process `parkingSpots` to calculate `total_reviews`
  const enrichedData = data.map((spot) =>
  ({
    ...spot,
    total_reviews: spot.reviews.length,
  })
  );

  // Convert keys to camelCase
  const results = convertObjectKeysToCamelCase(enrichedData);

  // Calculate pagination URLs
  const nextOffset = offset + limit < count ? (offset + limit) : null; // Adjusted to avoid off-by-one error
  const previousOffset = offset - limit >= 0 ? (offset - limit) : null;

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