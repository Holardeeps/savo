import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalance from "@/components/TotalBalance";
import { getAccounts, getLoggedInUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const Home = async () => {
  const loggednIn = await getLoggedInUser();
  if (!loggednIn) redirect("/sign-in");

  const accounts = loggednIn ? await getAccounts({ userId: loggednIn.$id }) : [];
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

        {/* Recent Transactions */}
      </div>

      <RightSidebar
        user={loggednIn}
        transactions={[]}
        banks={[{ currentBalance: 2730.36 }, { currentBalance: 1466.02 }]}
      />
    </section>
  );
};

export default Home;
