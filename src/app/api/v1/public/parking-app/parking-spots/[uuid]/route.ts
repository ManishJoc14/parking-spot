import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToCamelCase } from "@/lib/utils";

import { NextRequest } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const supabase = await createClient();

    const { uuid } = await params;

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
                vehicle_type,
                capacity
            ),
            features:parking_spot_features(
                feature
            ),
            availabilities:parking_spot_availability(
                day,
                start_time,
                end_time
            ),
            reviews:parking_spot_reviews(
                users:reviewer(uuid, full_name, photo),
                rating,
                comments,
                created_at
            )
        `)
        .eq('uuid', uuid)
        .single();

    console.log(error)
    console.log(data);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process `parkingSpots` to calculate `total_reviews` and `average_rating`
    const total_reviews = data.reviews.length;
    const average_rating =
        total_reviews > 0
            ? data.reviews.reduce((sum, review) => sum + review.rating, 0) / total_reviews
            : 0;


    // add total_reviews and average_rating to the data 
    const enrichedData = {
        ...data,
        total_reviews,
        average_rating,
    };

    // Convert keys to camelCase
    const result = convertObjectKeysToCamelCase(enrichedData);

    return NextResponse.json(result, { status: 200 });
}
