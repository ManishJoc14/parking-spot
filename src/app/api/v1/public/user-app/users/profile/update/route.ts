import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToSnakeCase } from "@/lib/utils";

export async function POST(req: Request) {
    const supabase = await createClient();
    const formData = await req.formData();

    type Body = {
        full_name: string,
        bio: string,
        phoneNo: string,
        photo?: File,
    }

    // Extract iformation from form data
    let body: Body = {
        full_name: formData.get('firstName') as string + ' ' + formData.get('middleName') as string + ' ' + formData.get('lastName') as string,
        bio: formData.get('bio') as string,
        phoneNo: formData.get('phoneNo') as string,
    };

    // add photo to body if provided
    let photo = formData.get('photo') as File || null;
    if (photo) {
        body = { ...body, photo };
    }

    if (!body) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Extract user information from request headers
    const userUuid = req.headers.get('user_uuid');
    if (!userUuid) {
        return NextResponse.json({ error: 'User UUID not provided' }, { status: 400 });
    }

    // Prepare data for updating the user profile
    let data = convertObjectKeysToSnakeCase({ ...body });

    // Handle photo upload if provided
    if (photo) {
        console.log({ photo })
        const { error: uploadError } = await supabase
            .storage
            .from('user_photos')
            .upload(`${userUuid}/photo.jpg`, photo, { upsert: true });

        if (uploadError) {
            return NextResponse.json({ error1: uploadError.message }, { status: 500 });
        }

        // update photo path in user profile
        data = convertObjectKeysToSnakeCase({ ...body, photo: `${userUuid}/photo.jpg` });
    }

    // Update user profile
    const { error: updateError } = await supabase
        .from('users')
        .update(data)
        .eq('uuid', userUuid);

    if (updateError) {
        return NextResponse.json({ error2: updateError.message }, { status: 500 });
    }

    // Return success message
    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });
}