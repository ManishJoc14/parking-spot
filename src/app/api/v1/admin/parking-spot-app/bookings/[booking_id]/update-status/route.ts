import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { BookingStatus } from "@/types/definitions";

export async function PUT(req: Request, { params }: { params: Promise<{ booking_id: number }> }) {
    const supabase = await createClient();

    // Wait for params to resolve
    const resolvedParams = await params;
    const { booking_id } = resolvedParams;
    
    if (!booking_id) {
        return NextResponse.json({ error: "Bookking ID is required" }, { status: 400 });
    }

    // extract booking status from request body
    type Body = {
        status: BookingStatus,
        parking_spot: number,
    };
    const body: Body = await req.json();
    if (!body) {
        return NextResponse.json({ error: "Booking status is required" }, { status: 400 });
    }

    // Extract user information from request headers
    const userUuid = req.headers.get('user_uuid');
    if (!userUuid) {
        return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
    }

    // Update the booking record
    const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: body.status, updated_at: new Date() })
        .eq('id', booking_id)
        .eq('parking_spot', body.parking_spot)
        .eq('user_id', userUuid);
    // to prevent unauthorized updates

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Booking updated successfully" }, { status: 200 });
}