import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // may not be required as we do it in middleware
  // if (!user) {
  //   return redirect("/sign-in");
  // }

  return (
    <div className="flex items-center justify-center h-screen">
      Protected Route
    </div>
  );
}
