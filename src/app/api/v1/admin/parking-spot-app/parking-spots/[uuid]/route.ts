import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToCamelCase, convertObjectKeysToSnakeCase, parseNestedFormData } from "@/lib/utils";
import { Availability, Feature, VehicleCapacity } from "@/types/definitions";
import { v4 as uuidv4 } from 'uuid';

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

        // Generate public URL for the stored file path
        const { data: imageData, error: urlError } = await supabase
            .storage
            .from('parking_photos')
            .createSignedUrl(enrichedData.cover_image, 60 * 60
            );
        // URL valid for 1 hour

        if (urlError) {
            enrichedData.cover_image = null;
        } else {
            enrichedData.cover_image = imageData.signedUrl;
        }

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


export async function PATCH(req: Request, { params }: { params: Promise<{ uuid: string }> }) {
    const supabase = await createClient();
    const formData = await req.formData();

    // Wait for params to resolve
    const resolvedParams = await params;
    const { uuid } = resolvedParams;
    const userUuid = req.headers.get("user_uuid");

    if (!uuid) {
        return NextResponse.json({ error: "Parking UUID is required" }, { status: 400 });
    }

    if (!userUuid) {
        return NextResponse.json({ error: "User UUID not provided." }, { status: 400 });
    }

    // Parse nested form data
    const rawData = await parseNestedFormData(formData);

    type Body = {
        name: string;
        address: string;
        postcode: string;
        description: string;
        latitude: number;
        longitude: number;
        ratePerHour: number;
        ratePerDay: number;
        features: Feature[];
        availabilities: Availability[];
        vehiclesCapacity: VehicleCapacity[];
        cover_image?: File | string;
    };

    // Construct the body object
    const body: Body = {
        name: rawData.name,
        address: rawData.address,
        postcode: rawData.postcode,
        description: rawData.description,
        latitude: parseFloat(rawData.latitude),
        longitude: parseFloat(rawData.longitude),
        ratePerHour: parseFloat(rawData.ratePerHour),
        ratePerDay: parseFloat(rawData.ratePerDay),
        features: rawData.features || [],
        availabilities: rawData.availabilities || [],
        vehiclesCapacity: rawData.vehiclesCapacity || [],
        cover_image: formData.get("coverImage") as File,
    };

    // Proceed to upload the new cover image if provided
    if (body.cover_image) {
        // Step1 : Retrieve the current cover image path from the database
        let coverImagePath = null;
        const { data: currentData, error: fetchError } = await supabase
            .from("parking_spots")
            .select("cover_image")
            .eq("uuid", uuid)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        // Step 2: If there is an existing cover image, delete it from storage
        if (currentData && currentData.cover_image) {
            const oldCoverImagePath = currentData.cover_image;
            const { error: deleteError } = await supabase.storage
                .from("parking_photos")
                .remove([oldCoverImagePath]);

            if (deleteError) {
                return NextResponse.json({ error: deleteError.message }, { status: 500 });
            }
        }

        const uniqueCoverImageId = uuidv4();
        coverImagePath = `${userUuid}/${uniqueCoverImageId}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from("parking_photos")
            .upload(coverImagePath, body.cover_image, { upsert: true });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        body.cover_image = coverImagePath;
    }

    // Prepare data for updating the parking spot
    const data = convertObjectKeysToSnakeCase(body);

    const { features, availabilities, vehicles_capacity, ...parkingSpotTableData } = data;

    try {
        // Call the transaction function
        const { data: parkingSpotId, error: insertParkingSpotError } = await supabase.rpc(
            "update_parking_spot_transaction",
            {
                parking_spot_uuid: uuid,
                parking_spot_data: { ...parkingSpotTableData, owner: userUuid },
                features: features,
                availabilities: availabilities,
                vehicles_capacity: vehicles_capacity,
            }
        );

        if (insertParkingSpotError) {
            throw new Error(insertParkingSpotError.message);
        }

        return NextResponse.json({ message: "Parking spot updated successfully." }, { status: 200 });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}