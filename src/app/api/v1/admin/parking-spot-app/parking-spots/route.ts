import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToCamelCase, convertObjectKeysToSnakeCase, parseNestedFormData } from "@/lib/utils";
import { Availability, Feature, VehicleCapacity } from "@/types/definitions";
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
    const supabase = await createClient();

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "5");

    // Extract user information from request headers or body
    const userUuid = req.headers.get('user_uuid');
    if (!userUuid) {
        return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
    }


    // Fetch total count of parking spots
    const { count, error: countError } = await supabase
        .from("parking_spots")
        .select("id", { count: "exact", head: true })
        .eq("owner", userUuid);

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

    // Apply pagination
    const { data, error } = await supabase
        .from("parking_spots")
        .select(
            `id:uuid, name, cover_image, address, rate_per_hour, rate_per_day, postcode`
        )
        .eq("owner", userUuid)
        .order("updated_at", { ascending: false })  // lastest 
        .range(offset, offset + limit - 1);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let updatedDatawithImages = await Promise.all(data.map(async (item: any) => {
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
                ? `/api/v1/admin/parking-spot-app/parking-spots?${buildQueryString({
                    limit,
                    offset: nextOffset,
                })}`
                : null,
        previous:
            previousOffset !== null
                ? `/api/v1/admin/parking-spot-app/parking-spots?${buildQueryString({
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


export async function POST(req: Request) {
    const supabase = await createClient();
    const formData = await req.formData();

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
        cover_image?: File;
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

    if (!body) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Extract user information from request headers
    const userUuid = req.headers.get("user_uuid");
    if (!userUuid) {
        return NextResponse.json({ error: "User UUID not provided" }, { status: 400 });
    }

    // Handle cover image upload if provided
    const uniqueCoverImageId = uuidv4();
    const coverImagePath = `${userUuid}/${uniqueCoverImageId}.jpg`;
    if (body.cover_image) {
        const { error: uploadError } = await supabase.storage
            .from("parking_photos")
            .upload(coverImagePath, body.cover_image, { upsert: true });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }
    }

    // Prepare data for inserting the parking spot
    const data = convertObjectKeysToSnakeCase({
        ...body,
        cover_image: coverImagePath,
    });

    const { features, availabilities, vehicles_capacity, ...parkingSpotTableData } = data;

    console.log({
        parking_spot_data: { ...parkingSpotTableData, owner: userUuid },
        features: features,
        availabilities: availabilities,
        vehicles_capacity: vehicles_capacity,
    })
    try {
        // Call the transaction function
        const { data: parkingSpotId, error: insertParkingSpotError } = await supabase.rpc(
            "create_parking_spot_transaction",
            {
                parking_spot_data: { ...parkingSpotTableData, owner: userUuid },
                features: features,
                availabilities: availabilities,
                vehicles_capacity: vehicles_capacity,
            }
        );

        if (insertParkingSpotError) {
            throw new Error(insertParkingSpotError.message);
        }

        return NextResponse.json({ message: "Parking spot created successfully." }, { status: 201 });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
