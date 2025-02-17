"use client";

import Link from "next/link";
import NavLinks from "@/components/adminComponents/navlinks";
import { LogOutIcon } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Image from "next/image";

export default function SideNav() {

  const { user, loading } = useAuth();

  const logout = async () => {
    const res = await axiosInstance.post("/auth/logout");
    toast.success(res.data.message);
    return redirect("/sign-in");
  };

  return (
    <div className="flex h-full sticky flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex flex-col justify-start rounded-md bg-primary pt-6 px-4 pb-4"
        href="/"
      >
        <div className="w-32 text-xl sm:text-3xl pb-2 text-white font-mont-semibold md:w-40 ">
          Parkify
        </div>
        {
          loading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-24 h-6 rounded-md bg-gray-200 animate-pulse"></div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <Image
                  width={32}
                  height={32}
                  src={user?.user_metadata?.avatar_url || "/avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-white font-mont-medium">
                  {user?.user_metadata?.full_name}
                </div>
              </div>
            </div>
          )
        }
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2 text-gray-700 dark:text-gray-300">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-gray-800 md:block"></div>
        <form>
          <div
            onClick={logout}
            className="flex h-[48px] cursor-pointer w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 dark:bg-gray-800 p-3 text-sm font-mont-medium hover:bg-primary/10 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <button type="submit" className="flex justify-center gap-2">
              <LogOutIcon />
              SignOut
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
