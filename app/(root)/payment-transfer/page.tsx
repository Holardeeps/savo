import HeaderBox from "@/components/HeaderBox";
import PaymentTransferForm from "@/components/PaymentTransferForm";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getAccounts } from "@/lib/actions/bank.actions";
import { redirect } from "next/navigation";

const Transfer = async () => {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/sign-in");

  const accounts = await getAccounts({ userId: loggedIn.$id });

  return (
    <section className="flex w-full flex-col gap-8 p-5 sm:p-8 lg:p-12">
      <HeaderBox
        title="Transfer Funds"
        subtext="Send money from one connected account to another account securely."
      />

      <div className="max-w-xl rounded-xl border border-gray-200 p-5 shadow-sm">
        <PaymentTransferForm accounts={accounts} />
      </div>
    </section>
  );
};

export default Transfer;
