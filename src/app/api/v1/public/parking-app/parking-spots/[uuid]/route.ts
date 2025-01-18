import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToCamelCase } from "@/lib/utils";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const supabase = await createClient();

        // Wait for params to resolve
        const resolvedParams = await params;
        const { uuid } = resolvedParams;

        if (!uuid) {
            return NextResponse.json({ error: "UUID is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("parking_spots")
            .select(`
        id,
        name,
        cover_image,
        description,
        address,
        rate_per_hour,
        rate_per_day,
        latitude,
        longitude,
        vehicles_capacity:parking_spot_vehicle_capacity(
          id,
          vehicle_type,
          capacity
        ),
        features:parking_spot_features(
          id,
          feature
        ),
        availabilities:parking_spot_availability(
          id,
          day,
          start_time,
          end_time
        ),
        reviews:parking_spot_reviews(
          id,
          reviewer:users(uuid, full_name, photo),
          rating,
          comments,
          created_at
        )
      `)
            .eq('uuid', uuid)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "Parking spot not found" }, { status: 404 });
        }

        // Calculate total reviews and average rating with optional chaining and nullish coalescing
        const total_reviews = data.reviews?.length ?? 0;
        const average_rating = total_reviews > 0
            ? data.reviews.reduce((sum, review) => sum + review.rating, 0) / total_reviews
            : 0;

        // Enrich data with review statistics
        const enrichedData = {
            ...data,
            total_reviews,
            average_rating,
        };

        // Convert keys to camelCase
        const result = convertObjectKeysToCamelCase(enrichedData);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        // Catch any unexpected errors
        console.error('Unexpected error in parking spot GET route:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}