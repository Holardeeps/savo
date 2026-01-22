import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalance from "@/components/TotalBalance";
import { getLoggedInUser } from "@/lib/actions/user.actions";

const Home = async () => {
  const loggednIn = await getLoggedInUser();
  // console.log(loggednIn);

  return (
    <section className="home no-scrollbar">
      <div className="home-content no-scrollbar">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggednIn?.name}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalance
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={12059.35}
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
