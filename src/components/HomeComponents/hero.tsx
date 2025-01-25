"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { getMessage, getRoute } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Hero() {

  const { user, loading } = useAuth();

  // if user is logged in but has no role, redirect to choose role page
  if (!loading && user && !user?.roles) {
    return redirect("/choose-role");
  }

  const roles = user?.roles;

  return (
    <div className="container mx-auto relative overflow-hidden ">
      <div className=" px-4 md:px-6 pb-8">
        <div className="flex flex-col items-center space-y-4 text-center pt-8 md:pt-12 lg:pt-16 pb-8 md:pb-12 lg:pb-16">
          <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
            <div className="absolute left-1/2 top-0 ml-[-38%] h-[25rem] w-[81.25rem] dark:opacity-10 bg-gradient-to-r from-primary/30 to-secondary/30 blur-[100px]" />
          </div>
          <div className="flex items-center">
            <span className="h-1 w-8 bg-green-500 rounded-xl"></span>
            <span className="text-muted-foreground rounded-lg px-2 py-1.5 text-sm uppercase sm:text-md font-mont-semibold">
              Parkify the best parking finder
            </span>
          </div>
          <h1 className="text-3xl space-y-6 font-mont-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-7xl">
            Discover Your Perfect <p className="text-primary"> Parking Spot</p>
          </h1>
          <p className="max-w-[42rem] leading-normal pt-4 text-muted-foreground sm:text-xl sm:leading-8">
            Book parking spots for cars, bikes, and scooters with ease. Save
            time and avoid the hassle of finding parking in busy areas.
          </p>
          {
            loading ? (
              <div className="h-12 w-36 rounded-md bg-gray-400 animate-pulse "></div>
            ) : (
              <div className="flex flex-col gap-4 pt-4 min-[400px]:flex-row justify-center">
                {roles && roles[0] && (
                  <Link href={getRoute(roles[0])}>
                    <Button
                      size="lg"
                      className="h-12 px-10 hover:scale-95 font-mont-medium transition-all"
                    >
                      {getMessage(roles[0])}
                    </Button>
                  </Link>
                )}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
