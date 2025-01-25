
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { role } = await request.json();

    const userUuid = request.headers.get('user_uuid');
    if (!userUuid) {
        return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
    };

    let { data, error } = await supabase
        .from('users')
        .update({ roles: [role] })
        .eq('uuid', userUuid)
        .select('roles')
        .single();

    console.log({ userUuid });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const roles = data?.roles;
    const response = NextResponse.json({ roles }, { status: 201 });

    if (roles && roles.length > 0) {
        response.cookies.set("role", String(roles[0]), {
            path: "/",
            secure: true,
            sameSite: "strict",
        });
    };
    response.cookies.set("isLoggedIn", "true", {
        path: "/",
        secure: true,
        sameSite: "strict",
    });
    return response;
}
