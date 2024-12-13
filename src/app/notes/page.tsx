import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function Page() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase.from("notes").select();

  if (error) {
    console.error("Error fetching notes:", error);
  }

  const addnote = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const note = formData.get("note") as string;
    const { error } = await supabase.from("notes").insert({ title: note });

    if (error) {
      console.log("Error adding note:", error);
    }
    revalidatePath("/notes");
  };

  return (
    <div className="flex flex-col h-full mt-20 justify-center items-center">
      <form action={addnote} className="max-w-md w-full">
        <Input placeholder="Add new Note.." name="note" />
        <Button type="submit" className="w-full my-4">
          Add
        </Button>
      </form>
      <pre>{JSON.stringify(notes, null, 2)}</pre>
    </div>
  );
}
