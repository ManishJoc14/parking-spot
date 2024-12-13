import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code"); // /?code=356e31f4-5da2-41f3-b137-3894c8d923bd like this
  const origin = requestUrl.origin; // origin: 'http://localhost:3000'
  
  // for password reset-process - /protected/reset-password
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // FIXME URL to redirect to after sign-up/sign-in process completes
  return NextResponse.redirect(`${origin}/protected`);
}
