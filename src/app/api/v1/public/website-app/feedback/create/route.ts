import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { fullName: full_name, ...rest } = await request.json();

  const supabase = await createClient();
  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert({
      full_name,
      ...rest,
    })
    .select("id, full_name, email, role, rating, message")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(feedback, { status: 201 });
}
