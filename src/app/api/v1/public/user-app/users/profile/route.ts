import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import splitName from "@/lib/utils";

export async function GET() {
    const supabase = await createClient();

    type UserProfile = {
        firstName: string,
        middleName: string,
        lastName: string,
        bio: string,
        phoneNo: string,
        photo: string,

        id: number;
        email: string;
        fullName: string;
        dateJoined: string;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        roles: string[];
    }

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    let { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, bio, phone_no, photo, roles')
        .eq('uuid', user?.id)
        .single();

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a signed URL for the stored file path
    const { data: imageData, error: urlError } = await supabase
        .storage
        .from('user_photos')
        .createSignedUrl(data.photo, 60 * 60
        );
    // URL valid for 1 hour

    if (urlError) {
        return NextResponse.json({ error1: urlError.message }, { status: 500 });
    }

    // construct user profile
    const [firstName, middleName, lastName] = splitName(data?.full_name);
    let userProfile: UserProfile = {
        id: data?.id,
        email: data?.email,
        firstName,
        middleName,
        lastName,
        fullName: data?.full_name,
        bio: data?.bio,
        phoneNo: data?.phone_no || "",
        photo: imageData.signedUrl,  // Use the signed URL
        roles: data?.roles,
        dateJoined: user?.created_at,
        isEmailVerified: user?.email_confirmed_at ? true : false,
        isPhoneVerified: user?.phone_confirmed_at ? true : false,
    };

    const roles = userProfile.roles;
    const response = NextResponse.json(userProfile, { status: 200 });
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
