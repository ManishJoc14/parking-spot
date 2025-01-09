import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { convertObjectKeysToCamelCase } from "@/lib/utils";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("id, full_name, email, role, rating, message")
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const feedbacks = convertObjectKeysToCamelCase(data);

  return NextResponse.json(feedbacks, { status: 200 });
}
