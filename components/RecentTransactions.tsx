import Link from "next/link";
import TransactionTable from "./TransactionTable";
import { getTransactionsByBankId } from "@/lib/actions/transaction.actions";

const RecentTransactions = async ({
  accounts,
  appwriteItemId,
  page,
}: RecentTransactionsProps) => {
  const activeAccount = accounts.find(
    (account) => account.appwriteItemId === appwriteItemId,
  );
  const fallbackAccount = accounts[0];
  const selectedAccount = activeAccount ?? fallbackAccount;

  if (!selectedAccount) return null;

  const transactions = await getTransactionsByBankId({
    bankId: selectedAccount.appwriteItemId,
    page,
  });

  return (
    <section className="recent-transactions">
      <div className="flex items-center justify-between">
        <h2 className="recent-transactions-label">Recent transactions</h2>
        <Link
          href={`/transaction-history?id=${selectedAccount.appwriteItemId}`}
          className="view-all-btn"
        >
          View all
        </Link>
      </div>

      <div className="recent-transactions-tablist no-scrollbar custom-scrollbar h-auto w-full justify-start overflow-x-auto rounded-none bg-transparent p-0">
        <div className="flex gap-3">
          {accounts.map((account) => (
            <Link
              key={account.appwriteItemId}
              href={`/?id=${account.appwriteItemId}`}
              className={`min-w-fit rounded-lg border px-4 py-2 text-14 font-medium ${
                account.appwriteItemId === selectedAccount.appwriteItemId
                  ? "border-bankGradient text-bankGradient"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {account.name}
            </Link>
          ))}
        </div>
      </div>
      <TransactionTable transactions={transactions?.documents ?? []} />
    </section>
  );
};

export default RecentTransactions;
