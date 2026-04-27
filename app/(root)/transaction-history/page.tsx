import HeaderBox from "@/components/HeaderBox";
import Pagination from "@/components/Pagination";
import TransactionTable from "@/components/TransactionTable";
import { getTransactionsByBankId } from "@/lib/actions/transaction.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getAccounts } from "@/lib/actions/bank.actions";
import Link from "next/link";
import { redirect } from "next/navigation";

const TransactionHistory = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/sign-in");

  const resolvedSearchParams = await searchParams;
  const accounts = (await getAccounts({ userId: loggedIn.$id })) ?? [];
  const pageValue = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const idValue = Array.isArray(resolvedSearchParams.id)
    ? resolvedSearchParams.id[0]
    : resolvedSearchParams.id;
  const page = Number(pageValue) || 1;
  const appwriteItemId = idValue || accounts[0]?.appwriteItemId;

  const account = accounts.find((item) => item.appwriteItemId === appwriteItemId);
  const transactionsData = account
    ? await getTransactionsByBankId({ bankId: account.appwriteItemId, page })
    : { total: 0, totalPages: 1, documents: [] };
  const transactions = (transactionsData?.documents ?? []) as Transaction[];
  const totalPages = transactionsData?.totalPages ?? 1;

  return (
    <section className="flex w-full flex-col gap-8 p-5 sm:p-8 lg:p-12">
      <HeaderBox
        title="Transaction History"
        subtext="Review recent incoming and outgoing payments on your selected bank account."
      />

      <div className="flex flex-wrap gap-3">
        {accounts.map((item) => (
          <Link
            key={item.appwriteItemId}
            href={`/transaction-history?id=${item.appwriteItemId}`}
            className={`rounded-lg border px-4 py-2 text-14 font-medium ${
              item.appwriteItemId === appwriteItemId
                ? "border-bankGradient text-bankGradient"
                : "border-gray-200 text-gray-600"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <TransactionTable transactions={transactions} />
      <Pagination page={page} totalPages={totalPages} />
    </section>
  );
};

export default TransactionHistory;
