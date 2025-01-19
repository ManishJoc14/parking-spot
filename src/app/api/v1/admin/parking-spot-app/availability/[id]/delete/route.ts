import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();

        // Wait for params to resolve
        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json({ error: "ID of availabity is required to delete." }, { status: 400 });
        }

        // Extract user information from request headers or body
        const userUuid = req.headers.get('user_uuid');
        if (!userUuid) {
            return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
        }

        // Step 1: Fetch the parking spot IDs for the given owner
        const { data: spots, error: fetchError } = await supabase
            .from('parking_spots')
            .select('id')
            .eq('owner', userUuid);

        if (fetchError) {
            return NextResponse.json({ error: `Error fetching parking spot id's while deleting availability:  ${fetchError.message} ` }, { status: 500 });
        }

        // Step 2: Delete from parking_spot_availability using the fetched IDs
        if (spots.length > 0) {
            const spotIds = spots.map(spot => spot.id);

            const { error: deleteError } = await supabase
                .from("parking_spot_availability")
                .delete()
                .eq('id', id)
                .in('parking_spot', spotIds);


            if (deleteError) {
                return NextResponse.json({ error: `Error deleting availability:  ${deleteError.message} ` }, { status: 500 });
            }
        } else {
            NextResponse.json('No parking spots found for the given owner.');
        }

        return NextResponse.json({ message: `Availability with id(${id}) deleted successfully.` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}