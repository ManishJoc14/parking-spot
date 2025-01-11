import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
    convertObjectKeysToCamelCase,
    convertObjectKeysToSnakeCase,
} from "@/lib/utils";

export async function POST(request: Request) {
    const body = await request.json();
    const reviewToInsert = convertObjectKeysToSnakeCase(body);

    // Extract user information from request headers or body
    const userUuid = request.headers.get('user_uuid');
    if (!userUuid) {
        return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
    };

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("parking_spot_reviews")
        .insert({ ...reviewToInsert, reviewer: userUuid })
        .select("parking_spot, rating, comments")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const review = convertObjectKeysToCamelCase(data);

    return NextResponse.json(review, { status: 201 });
}
