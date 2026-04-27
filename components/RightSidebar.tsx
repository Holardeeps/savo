import Image from "next/image";
import Link from "next/link";
import BankCard from "./BankCard";
import Category from "./Category";
import { countTransactionCategories } from "@/lib/utils";

const RightSidebar = ({ user, transactions, banks }: RightSidebarProps) => {
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const initial = user?.firstName?.[0] ?? user?.lastName?.[0] ?? "";
  const categories = countTransactionCategories(transactions || []).slice(0, 3);

  return (
    <aside className="right-sidebar no-scrollbar">
      <section className="flex flex-col pb-8">
        <div className="profile-banner" />
        <div className="profile">
          <div className="profile-img">
            <span className="text-5xl font-bold text-blue-500">{initial}</span>
          </div>

          <div className="profile-details">
            <h1 className="profile-name">{fullName}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-between gap-8 px-6 py-8">
        <div className="flex w-full justify-between">
          <h2 className="header-2">My Banks</h2>
          <Link href={"/"} className="flex gap-2">
            <Image src={"/icons/plus.svg"} width={20} height={20} alt="plus" />
            <h2 className="text-14 font-semibold text-gray-600">Add Bank</h2>
          </Link>
        </div>

        {banks?.length > 0 && (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-5">
            <div className="relative z-10">
              <BankCard
                key={banks[0].$id}
                account={banks[0]}
                userName={fullName}
                showBalance={false}
              />
            </div>
            {banks[1] && (
              <div className="absolute -right-4 w-[96%] top-8 z-0 ">
                <BankCard
                  key={banks[1].$id}
                  account={banks[1]}
                  userName={fullName}
                  showBalance={false}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="header-2">Spending Categories</h2>
          {categories.length > 0 ? (
            categories.map((category) => (
              <Category key={category.name} category={category} />
            ))
          ) : (
            <p className="text-14 text-gray-500">No spending data yet.</p>
          )}
        </div>
      </section>
    </aside>
  );
};

export default RightSidebar;
