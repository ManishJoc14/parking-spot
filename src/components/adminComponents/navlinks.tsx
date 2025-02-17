"use client";

import { HomeIcon, Settings, User } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { v4 as uuidv4 } from "uuid";


const links = [
  { name: "Bookings", href: "/admin/bookings", icon: HomeIcon },
  {
    name: "Parking Spots",
    href: "/admin/parking-spots",
    icon: Settings,
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: User,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={uuidv4()}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 dark:bg-gray-800 p-3 text-sm font-mont-medium hover:bg-primary/10 hover:text-primary transition-all md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-primary/10 text-primary": pathname.includes(link.href),
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
