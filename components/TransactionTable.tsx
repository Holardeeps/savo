import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import CategoryBadge from "./CategoryBadge";
import { formatAmount, formatDateTime } from "@/lib/utils";

const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return (
    <div className="rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.$id}>
                <TableCell className="font-medium text-gray-900">
                  {transaction.name}
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {formatAmount(transaction.amount)}
                </TableCell>
                <TableCell>{transaction.pending ? "Processing" : "Success"}</TableCell>
                <TableCell>
                  {formatDateTime(new Date(transaction.$createdAt)).dateTime}
                </TableCell>
                <TableCell className="capitalize">
                  {transaction.channel ?? "online"}
                </TableCell>
                <TableCell>
                  <CategoryBadge category={transaction.category ?? "Transfer"} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
