import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();


  let { data, error } = await supabase
    .from('users')
    .select('roles')
    .eq('uuid', user?.id)
    .single();


  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const roles = data?.roles;
  const response = NextResponse.json({ user, roles }, { status: 200 });
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
