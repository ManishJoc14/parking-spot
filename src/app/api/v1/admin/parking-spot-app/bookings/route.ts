import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToCamelCase } from "@/lib/utils";

export async function GET(req: Request) {
    const supabase = await createClient();

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "5");
    const search = searchParams.get("search");

    // Extract user information from request headers or body
    const userUuid = req.headers.get('user_uuid');
    if (!userUuid) {
        return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
    }


    // Fetch total count of parking spots
    const { count, error: countError } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userUuid);

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


    let query = supabase
        .from("bookings")
        .select(
            `id, status, booking_no, start_time,
             end_time, amount, payment_status, 
             vehicle_no, vehicle, is_active, created_at,
             updated_at, parking_spot, 
             user_id
            `)
        .eq("user_id", userUuid)
        .order("updated_at", { ascending: false });

    if (search) {
        query = query.or(`vehicle_no.ilike.%${search}%,booking_no.ilike.%${search}%%`);
    }

    // Apply pagination
    const { data, error } = await query
        .range(offset, offset + limit - 1);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert keys to camelCase
    const results = convertObjectKeysToCamelCase(data);

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
                ? `/api/v1/admin/parking-spot-app/bookings?${buildQueryString({
                    limit,
                    offset: nextOffset,
                    search
                })}`
                : null,
        previous:
            previousOffset !== null
                ? `/api/v1/admin/parking-spot-app/bookings?${buildQueryString({
                    limit,
                    offset: previousOffset,
                    search
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
