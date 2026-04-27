import HeaderBox from "@/components/HeaderBox";
import RecentTransactions from "@/components/RecentTransactions";
import RightSidebar from "@/components/RightSidebar";
import TotalBalance from "@/components/TotalBalance";
import { getAccounts, getLoggedInUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const Home = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const loggednIn = await getLoggedInUser();
  if (!loggednIn) redirect("/sign-in");

  const resolvedSearchParams = await searchParams;
  const accounts = loggednIn ? await getAccounts({ userId: loggednIn.$id }) : [];
  const pageValue = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const idValue = Array.isArray(resolvedSearchParams.id)
    ? resolvedSearchParams.id[0]
    : resolvedSearchParams.id;
  const page = Number(pageValue) || 1;
  const appwriteItemId = idValue || accounts[0]?.appwriteItemId;
  const userFullName = `${loggednIn?.firstName ?? ""} ${loggednIn?.lastName ?? ""}`.trim();
  const totalBanks = accounts.length;
  const totalCurrentBalance = accounts.reduce(
    (total: number, account: Account) => total + (account.currentBalance ?? 0),
    0,
  );
  // console.log(loggednIn);

  return (
    <section className="home no-scrollbar">
      <div className="home-content no-scrollbar">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={userFullName}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalance
            accounts={accounts}
            totalBanks={totalBanks}
            totalCurrentBalance={totalCurrentBalance}
          />
        </header>

        <RecentTransactions
          accounts={accounts}
          appwriteItemId={appwriteItemId}
          page={page}
        />
      </div>

      <RightSidebar
        user={loggednIn}
        transactions={[]}
        banks={accounts}
      />
    </section>
  );
};

export default Home;
