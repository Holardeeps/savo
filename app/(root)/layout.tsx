import MobileNav from "@/components/MobileNav";
import SideBar from "@/components/SideBar";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const loggedIn = { firstName: "Praise", lastName: "HDP" }
  
  return (
    <main className="flex h-screen w-full font-inter">
        <SideBar user={loggedIn} />

        <div className="flex size-full flex-col">
          <div className="h-16 flex items-center justify-between p-5 shadow-creditCard sm:p-8 md:hidden">
            <Image
              src={'/icons/logo.svg'}
              width={30}
              height={30}
              alt="menu icon"
             />
            <div className="">
              <MobileNav user={loggedIn} />
            </div>
          </div>
          {children}
        </div>
    </main>
  );
}
