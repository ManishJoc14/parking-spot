import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    const body = await request.json();
    const { email } = body;

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from("newsletters")
        .insert({ email });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Newsletter subscribed successfuly!!" }, { status: 201 });
}
