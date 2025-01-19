import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToCamelCase } from "@/lib/utils";

export async function GET(req: Request) {
  const supabase = await createClient();

  // Extract query parameters
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "5");
  const latitude = parseFloat(searchParams.get("latitude") || "0");
  const longitude = parseFloat(searchParams.get("longitude") || "0");
  const vehicleType = searchParams.getAll("vehicle_type");
  const features = searchParams.getAll("features");
  const ordering = searchParams.get("ordering") || "rate_per_hour";
  const search = searchParams.get("search");

  // Determine if ordering is descending
  const isDescending = ordering.startsWith("-");

  // Fetch total count of parking spots
  const { count, error: countError } = await supabase
    .from("parking_spots")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  // Handle case with no results
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

  // Build query for fetching parking spots
  let query;
  if (ordering.includes("distance")) {
    query = supabase.rpc("get_parking_spots_with_distance", {
      latitude_param: latitude,
      longitude_param: longitude,
      limit_param: limit,
      offset_param: offset,
    });
  } else {
    query = supabase
      .from("parking_spots")
      .select(
        `
        id, uuid, name, cover_image, description, address, rate_per_hour, rate_per_day, latitude, longitude, postcode, average_rating,
        reviews:parking_spot_reviews ( id, rating ),
        vehicle_types:parking_spot_vehicle_capacity ( id, vehicle_type ),
        features:parking_spot_features ( id, feature )
        `
      )
      .in("vehicle_types.vehicle_type", vehicleType.length ? vehicleType : [])
      .in("features.feature", features.length ? features : []);

    if
      (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,postcode.ilike.%${search}%`);
    }
  }

  // Apply ordering and pagination
  const { data, error } = await query
    .order(isDescending ? ordering.slice(1) : ordering, { ascending: !isDescending })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich results with additional data
  const enrichedData = data.map((spot: any) => ({
    ...spot,
    total_reviews: spot.reviews?.length || 0,
  }));

  let updatedDatawithImages = await Promise.all(enrichedData.map(async (item: any) => {
    let cover_image = item.cover_image;
    // Generate public URL for the stored file path

    const { data: imageData, error: urlError } = await supabase
      .storage
      .from('parking_photos')
      .createSignedUrl(cover_image, 60 * 60
      );
    // URL valid for 1 hour

    if (urlError) {
      return { ...item, cover_image: null };
    } else {
      return { ...item, cover_image: imageData.signedUrl };
    }
  }));

  // Convert keys to camelCase
  const results = convertObjectKeysToCamelCase(updatedDatawithImages);

  // Utility function to build query strings for pagination
  const buildQueryString = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else if (value !== null && value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  };

  // Calculate pagination URLs
  const nextOffset = offset + limit < count ? offset + limit : null;
  const previousOffset = offset - limit >= 0 ? offset - limit : null;

  const pagination = {
    next:
      nextOffset !== null
        ? `/api/v1/public/parking-app/parking-spots?${buildQueryString({
          latitude,
          longitude,
          vehicle_type: vehicleType,
          features,
          ordering,
          limit,
          offset: nextOffset,
        })}`
        : null,
    previous:
      previousOffset !== null
        ? `/api/v1/public/parking-app/parking-spots?${buildQueryString({
          latitude,
          longitude,
          vehicle_type: vehicleType,
          features,
          ordering,
          limit,
          offset: previousOffset,
        })}`
        : null,
  };

  // Construct the final response
  const response = {
    count,
    ...pagination,
    results,
  };

  return NextResponse.json(response, { status: 200 });
}
