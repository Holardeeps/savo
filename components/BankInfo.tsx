import { formatAmount } from "@/lib/utils";

const BankInfo = ({ account, appwriteItemId, type }: BankInfoProps) => {
  if (type === "card") {
    return (
      <div className="rounded-xl border border-gray-200 p-4">
        <p className="text-12 text-gray-500">{account.officialName}</p>
        <p className="text-16 font-semibold text-gray-900">{account.name}</p>
        <p className="text-14 text-gray-600">•••• {account.mask || "0000"}</p>
        <p className="text-18 font-semibold text-gray-900 mt-2">
          {formatAmount(account.currentBalance)}
        </p>
        {appwriteItemId && (
          <p className="text-12 text-gray-500 mt-1">Ref: {appwriteItemId}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <h3 className="text-16 font-semibold text-gray-900">{account.name}</h3>
      <p className="text-14 text-gray-600">{account.officialName}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-14">
        <p className="text-gray-500">Current Balance</p>
        <p className="text-gray-900 font-medium text-right">
          {formatAmount(account.currentBalance)}
        </p>
        <p className="text-gray-500">Available Balance</p>
        <p className="text-gray-900 font-medium text-right">
          {formatAmount(account.availableBalance)}
        </p>
        <p className="text-gray-500">Type</p>
        <p className="text-gray-900 font-medium text-right capitalize">
          {account.type}
        </p>
        <p className="text-gray-500">Mask</p>
        <p className="text-gray-900 font-medium text-right">•••• {account.mask}</p>
      </div>
    </div>
  );
};

export default BankInfo;
