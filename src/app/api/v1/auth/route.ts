import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();


  let { data, error: roleError } = await supabase
    .from('users')
    .select('roles')
    .eq('uuid', user?.id)
    .single();


  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }
  
  if (roleError?.code === "PGRST116") {
    console.log("role not found");
  }

  const roles = data?.roles || null;

  const response = NextResponse.json({ user, roles: roles }, { status: 200 });
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
