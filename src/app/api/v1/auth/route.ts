import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(user, { status: 200 });
}
