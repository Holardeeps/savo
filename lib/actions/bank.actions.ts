"use server";

import { CountryCode } from "plaid";
import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";
import { getTransactionsByBankId } from "./transaction.actions";
import { getBank, getBanks } from "./user.actions";

export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    return parseStringify(institutionResponse.data.institution);
  } catch (error) {
    console.error("Error getting institution:", error);
    return null;
  }
};

export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let cursor: string | undefined = undefined;
  const transactions: Transaction[] = [];

  try {
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor,
      });

      const data = response.data;
      const pageTransactions = data.added.map((transaction) => ({
        id: transaction.transaction_id,
        $id: transaction.transaction_id,
        name: transaction.name,
        paymentChannel: transaction.payment_channel,
        type: transaction.payment_channel,
        accountId: transaction.account_id,
        amount: transaction.amount,
        pending: transaction.pending,
        category: transaction.category ? transaction.category[0] : "",
        date: transaction.date,
        image: transaction.logo_url ?? "",
        $createdAt: transaction.datetime ?? transaction.date,
        channel: transaction.payment_channel,
        senderBankId: "",
        receiverBankId: "",
      }));

      transactions.push(...pageTransactions);
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error("Error getting plaid transactions:", error);
    return [];
  }
};

export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    const banks = (await getBanks({ userId })) ?? [];

    const accounts = await Promise.all(
      banks.map(async (bank: Bank) => {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: bank.accessToken,
        });

        const accountData =
          accountsResponse.data.accounts.find(
            (account) => account.account_id === bank.accountId,
          ) ?? accountsResponse.data.accounts[0];
        if (!accountData) return null;

        return {
          id: accountData.account_id,
          availableBalance: accountData.balances.available ?? 0,
          currentBalance: accountData.balances.current ?? 0,
          institutionId: accountsResponse.data.item?.institution_id ?? "",
          name: accountData.name,
          officialName: accountData.official_name ?? accountData.name,
          mask: accountData.mask ?? "",
          type: accountData.type as string,
          subtype: accountData.subtype ?? "",
          appwriteItemId: bank.$id,
          shareableId: bank.shareableId,
        } as Account;
      }),
    );

    const validAccounts = accounts.filter(
      (account): account is Account => account !== null,
    );
    return parseStringify(validAccounts);
  } catch (error) {
    console.error("Error getting accounts:", error);
    return [];
  }
};

export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    const bank = await getBank({ documentId: appwriteItemId });
    if (!bank) return null;

    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData =
      accountsResponse.data.accounts.find(
        (account) => account.account_id === bank.accountId,
      ) ?? accountsResponse.data.accounts[0];
    if (!accountData) return null;

    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions: Transaction[] = (
      transferTransactionsData?.documents ?? []
    ).map((transferData: Transaction) => ({
      id: transferData.$id,
      $id: transferData.$id,
      name: transferData.name,
      amount: transferData.amount,
      date: transferData.$createdAt,
      paymentChannel: transferData.channel,
      category: transferData.category,
      type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      accountId: bank.accountId,
      pending: false,
      image: "",
      $createdAt: transferData.$createdAt,
      channel: transferData.channel,
      senderBankId: transferData.senderBankId,
      receiverBankId: transferData.receiverBankId,
    }));

    const plaidTransactions = await getTransactions({ accessToken: bank.accessToken });

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available ?? 0,
      currentBalance: accountData.balances.current ?? 0,
      institutionId: accountsResponse.data.item?.institution_id ?? "",
      name: accountData.name,
      officialName: accountData.official_name ?? accountData.name,
      mask: accountData.mask ?? "",
      type: accountData.type as string,
      subtype: accountData.subtype ?? "",
      appwriteItemId: bank.$id,
      shareableId: bank.shareableId,
    } as Account;

    const allTransactions = [...plaidTransactions, ...transferTransactions].sort(
      (a, b) =>
        new Date(b.date ?? b.$createdAt).getTime() -
        new Date(a.date ?? a.$createdAt).getTime(),
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("Error getting account:", error);
    return null;
  }
};
