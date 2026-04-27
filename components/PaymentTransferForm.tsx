"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { transferPayment } from "@/lib/actions/transaction.actions";

const PaymentTransferForm = ({ accounts }: PaymentTransferFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [senderBankId, setSenderBankId] = useState(accounts[0]?.appwriteItemId ?? "");
  const [receiverShareableId, setReceiverShareableId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const canSubmit = useMemo(() => {
    return Boolean(senderBankId && receiverShareableId && email && name && amount);
  }, [amount, email, name, receiverShareableId, senderBankId]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await transferPayment({
        senderBankId,
        receiverShareableId,
        amount,
        email,
        name,
      });

      if (result.success) {
        router.push("/transaction-history");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="senderBank">Select source bank</Label>
        <Select value={senderBankId} onValueChange={setSenderBankId}>
          <SelectTrigger id="senderBank" className="w-full">
            <SelectValue placeholder="Select source account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.appwriteItemId} value={account.appwriteItemId}>
                {account.name} (•••• {account.mask})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receiverBank">Receiver Bank ID</Label>
        <Input
          id="receiverBank"
          placeholder="Enter receiver shareable bank id"
          value={receiverShareableId}
          onChange={(event) => setReceiverShareableId(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receiverEmail">Receiver Email</Label>
        <Input
          id="receiverEmail"
          type="email"
          placeholder="Enter receiver email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionName">Note</Label>
        <Input
          id="transactionName"
          placeholder="e.g. Rent payment"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>

      <Button type="submit" className="form-btn w-full" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? "Processing..." : "Transfer Funds"}
      </Button>
    </form>
  );
};

export default PaymentTransferForm;
