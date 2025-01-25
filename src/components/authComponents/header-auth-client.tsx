"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/authContext";

export default function HeaderAuthClient() {

  const { user, loading } = useAuth();

  if (loading) {
    return <>
      <div className="animate-pulse flex items-center text-sm gap-4 mr-12">
        <div className="w-40 rounded-md bg-gray-400 h-8"></div>
        <div className="w-20 rounded-md bg-gray-400 h-8"></div>
      </div>
    </>;
  }

  const handleSignOut = async (e: FormEvent) => {
    e.preventDefault();
    const res = await axiosInstance.post("/auth/logout");
    toast.success(res.data.message);
    return redirect("/sign-in");
  };


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
    <div className="flex items-center text-sm gap-4 mr-12">
      <Link href={getRoute("Owner")}>Hey, {user?.user_metadata?.full_name}!</Link>
      <Button onClick={handleSignOut} variant={"outline"}>
        Sign out
      </Button>
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
