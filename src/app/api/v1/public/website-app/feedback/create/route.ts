import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  convertObjectKeysToCamelCase,
  convertObjectKeysToSnakeCase,
} from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const feedbackToInsert = convertObjectKeysToSnakeCase(body);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .insert(feedbackToInsert)
    .select("id, full_name, email, role, rating, message")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const feedback = convertObjectKeysToCamelCase(data);

  return NextResponse.json(feedback, { status: 201 });
}
