"use server";

import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { plaidClient } from "@/lib/plaid";
import { createAdminClient } from "@/lib/appwrite";
import { createTransfer } from "./dwolla.actions";
import { decryptId, parseStringify } from "@/lib/utils";
import { getBankByAccountId } from "./user.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export const createTransaction = async ({
  name,
  amount,
  senderId,
  senderBankId,
  receiverId,
  receiverBankId,
  email,
}: CreateTransactionProps) => {
  try {
    const { database } = await createAdminClient();

    const transaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      {
        name,
        amount,
        senderId,
        senderBankId,
        receiverId,
        receiverBankId,
        email,
        channel: "online",
        category: "Transfer",
      },
    );

    return parseStringify(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return null;
  }
};

export const getTransactionsByBankId = async ({
  bankId,
  page = 1,
}: getTransactionsByBankIdProps) => {
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const toPaginatedResult = (documents: Record<string, unknown>[]) => {
    const sorted = [...documents].sort(
      (a, b) =>
        new Date(String(b.$createdAt ?? 0)).getTime() -
        new Date(String(a.$createdAt ?? 0)).getTime(),
    );
    const paginated = sorted.slice(offset, offset + pageSize);
    return parseStringify({
      total: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
      documents: paginated,
    });
  };

  try {
    const { database } = await createAdminClient();

    const senderDocs = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [
        Query.equal("senderBankId", [bankId]),
        Query.orderDesc("$createdAt"),
        Query.limit(pageSize),
        Query.offset(offset),
      ],
    );

    const receiverDocs = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [
        Query.equal("receiverBankId", [bankId]),
        Query.orderDesc("$createdAt"),
        Query.limit(pageSize),
        Query.offset(offset),
      ],
    );

    const merged = [...senderDocs.documents, ...receiverDocs.documents].sort(
      (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
    );

    const uniqueById = Array.from(new Map(merged.map((doc) => [doc.$id, doc])).values());
    const paginated = uniqueById.slice(0, pageSize);
    const total = senderDocs.total + receiverDocs.total;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return parseStringify({
      total,
      totalPages,
      documents: paginated,
    });
  } catch (error) {
    // Compatibility fallback:
    // some setups have a transactions collection without sender/receiver fields yet.
    // In that case, fetch a larger slice and filter in memory across known field shapes.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 400 &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("Attribute not found in schema")
    ) {
      try {
        const { database } = await createAdminClient();
        const docs = await database.listDocuments(
          DATABASE_ID!,
          TRANSACTION_COLLECTION_ID!,
          [Query.orderDesc("$createdAt"), Query.limit(100)],
        );

        const filtered = docs.documents.filter((doc) => {
          const senderBankId = String(doc.senderBankId ?? "");
          const receiverBankId = String(doc.receiverBankId ?? "");
          const directBankId = String(doc.bankId ?? "");
          const accountId = String(doc.accountId ?? "");
          return (
            senderBankId === bankId ||
            receiverBankId === bankId ||
            directBankId === bankId ||
            accountId === bankId
          );
        });

        return toPaginatedResult(filtered as Record<string, unknown>[]);
      } catch (fallbackError) {
        console.error(
          "Error getting transactions by bank id (fallback):",
          fallbackError,
        );
      }
    } else {
      console.error("Error getting transactions by bank id:", error);
    }

    return parseStringify({ total: 0, totalPages: 1, documents: [] });
  }
};

export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.getDocument(
      DATABASE_ID!,
      process.env.APPWRITE_BANK_COLLECTION_ID!,
      appwriteItemId,
    );

    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });

    const account =
      accountsResponse.data.accounts.find(
        (item) => item.account_id === bank.accountId,
      ) ?? accountsResponse.data.accounts[0];

    if (!account) return null;

    return parseStringify({
      id: account.account_id,
      availableBalance: account.balances.available ?? 0,
      currentBalance: account.balances.current ?? 0,
      officialName: account.official_name ?? account.name,
      mask: account.mask ?? "",
      institutionId: accountsResponse.data.item?.institution_id ?? "",
      name: account.name,
      type: account.type,
      subtype: account.subtype ?? "",
      appwriteItemId: bank.$id,
      shareableId: bank.shareableId,
    });
  } catch (error) {
    console.error("Error getting account:", error);
    return null;
  }
};

export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"],
    });

    return parseStringify(response.data.institution);
  } catch (error) {
    console.error("Error getting institution:", error);
    return null;
  }
};

export const transferPayment = async ({
  senderBankId,
  receiverShareableId,
  amount,
  email,
  name,
}: {
  senderBankId: string;
  receiverShareableId: string;
  amount: string;
  email: string;
  name: string;
}) => {
  try {
    const { database } = await createAdminClient();
    const senderBank = await database.getDocument(
      DATABASE_ID!,
      process.env.APPWRITE_BANK_COLLECTION_ID!,
      senderBankId,
    );
    if (!senderBank?.fundingSourceUrl) {
      throw new Error("Sender bank funding source not found");
    }

    const receiverBank = await getBankByAccountId({
      accountId: decryptId(receiverShareableId),
    });
    if (!receiverBank) throw new Error("Receiver bank account not found");

    await createTransfer({
      sourceFundingSourceUrl: senderBank.fundingSourceUrl,
      destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
      amount,
    });

    await createTransaction({
      name,
      amount,
      senderId: senderBank.userId,
      senderBankId,
      receiverId: receiverBank.userId,
      receiverBankId: receiverBank.$id,
      email,
    });

    revalidatePath("/");
    revalidatePath("/payment-transfer");
    revalidatePath("/transaction-history");

    return { success: true };
  } catch (error) {
    console.error("Transfer payment failed:", error);
    return { success: false };
  }
};
