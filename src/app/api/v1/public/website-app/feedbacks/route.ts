import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: feedbacks, error } = await supabase
    .from("feedback")
    .select("id, full_name, email, role, rating, message")
    .limit(10);

  console.log(feedbacks);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(feedbacks, { status: 200 });
}
