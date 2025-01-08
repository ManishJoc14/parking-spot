"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import axiosInstance from "@/lib/axiosInstance";

export default function HeaderAuthClient() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchuser = async () => {
      const response = await axiosInstance.get("/auth");
      setUser(response.data);
    };

    fetchuser();
  }, []);

  const getRoute = (role: string) => {
    if (role === "Owner") {
      return "/admin/parking-spots";
    }
    if (role === "Driver") {
      return "/parking";
    }
    return "/";
  };

  return user ? (
    <div className="flex items-center text-sm gap-4">
      <Link href={getRoute("Owner")}>Hey,{user.email}!</Link>
      <form action={signOutAction}>
        <Button asChild type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
