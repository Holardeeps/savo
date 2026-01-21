"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MobileNav = ({ user }: MobileNavProps) => {
  const pathname = usePathname();

  return (
    <section className="w-full max-w-66">
      <Sheet>
        <SheetTrigger>
          <Image
            src={"/icons/hamburger.svg"}
            width={30}
            height={30}
            alt="menu"
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-white">
          <SheetTitle>
            <SheetClose asChild>
              <Link
                href={"/"}
                className="flex cursor-pointer items-center gap-1 px-4 pt-4"
              >
                <Image
                  src={"/icons/logo.svg"}
                  width={34}
                  height={34}
                  alt="Savo finance logo"
                  // className='size-8  max-xl:size-14'
                />
                <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
                  Savo
                </h1>
              </Link>
            </SheetClose>
          </SheetTitle>

          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <nav className="flex h-full flex-col gap-6 pt-16 text-white">
                {sidebarLinks.map((item) => {
                  const isActive =
                    pathname === item.route ||
                    pathname.startsWith(`${item.route}/`);

                  return (
                    <SheetClose asChild key={item.label}>
                      <Link
                        href={item.route}
                        // key={item.label}
                        className={cn(
                          "flex gap-3 items-center p-4 rounded-lg w-full max-w-60",
                          {
                            "bg-bank-gradient": isActive,
                          },
                        )}
                      >
                        <Image
                          src={item.imgURL}
                          alt={item.label}
                          width={20}
                          height={20}
                          className={cn({
                            "brightness-[3] invert-0": isActive,
                          })}
                        />
                        <p
                          className={cn("font-semibold text-black-2", {
                            "text-white!": isActive,
                          })}
                        >
                          {item.label}
                        </p>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetClose>
            <SheetDescription className="sr-only"></SheetDescription>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
