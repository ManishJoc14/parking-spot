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
            return NextResponse.json({ error: "ID of feature is required to delete." }, { status: 400 });
        }

        // Extract user information from request headers or body
        const userUuid = req.headers.get('user_uuid');
        if (!userUuid) {
            return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
        }

        const { error } = await supabase
            .from("parking_spot_features")
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: `Feature with id(${id}) deleted successfully.` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}