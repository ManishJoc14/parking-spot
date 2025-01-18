import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ message: "logout successful!!" }, { status: 200 });

    response.cookies.delete({ name: "role", path: "/" });
    response.cookies.delete({ name: "isLoggedIn", path: "/", secure: true, sameSite: "strict" });

    return response;
}
