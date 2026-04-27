import BankCard from "@/components/BankCard";
import BankInfo from "@/components/BankInfo";
import HeaderBox from "@/components/HeaderBox";
import {
  getAccounts,
  getLoggedInUser,
  getUserInfo,
} from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/sign-in");

  const user = await getUserInfo({ userId: loggedIn.userId });
  const accounts = await getAccounts({ userId: loggedIn.$id });

  return (
    <section className="flex w-full flex-col gap-8 p-5 sm:p-8 lg:p-12">
      <HeaderBox
        title="My Bank Accounts"
        subtext="View your connected bank accounts and their current balances."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {accounts.map((account) => (
          <BankCard
            key={account.id}
            account={account}
            userName={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {accounts.map((account) => (
          <BankInfo
            key={account.id}
            account={account}
            appwriteItemId={account.appwriteItemId}
            type="full"
          />
        ))}
      </div>
    </section>
  );
};

export default MyBanks;
