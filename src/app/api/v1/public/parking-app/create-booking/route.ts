import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
    convertObjectKeysToCamelCase,
    convertObjectKeysToSnakeCase,
} from "@/lib/utils";

export async function POST(request: Request) {
    const body = await request.json();
    const bookingToInsert = convertObjectKeysToSnakeCase(body);

    // Extract user information from request headers or body
    const userUuid = request.headers.get('user_uuid');
    if (!userUuid) {
        return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("bookings")
        .insert({ ...bookingToInsert, user_id: userUuid })
        .select(`
            booking_no,
            vehicle_no,
            vehicle,
            status,
            start_time,
            end_time,
            payment_status,
            amount`)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const booking = convertObjectKeysToCamelCase(data);

    return NextResponse.json({ ...booking, message: "Booking successful!!" }, { status: 201 });
}
