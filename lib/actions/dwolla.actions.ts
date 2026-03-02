"use server";

import { Client } from "dwolla-v2";

const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        "Dwolla environment should either be set to `sandbox` or `production`",
      );
  }
};

const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

const getDuplicateCustomerHref = (err: unknown): string | null => {
  if (typeof err !== "object" || err === null || !("body" in err)) {
    return null;
  }

  const body = err.body;
  if (
    typeof body !== "object" ||
    body === null ||
    !("_embedded" in body) ||
    typeof body._embedded !== "object" ||
    body._embedded === null ||
    !("errors" in body._embedded) ||
    !Array.isArray(body._embedded.errors)
  ) {
    return null;
  }

  for (const embeddedError of body._embedded.errors) {
    if (
      typeof embeddedError === "object" &&
      embeddedError !== null &&
      "code" in embeddedError &&
      embeddedError.code === "Duplicate" &&
      "_links" in embeddedError &&
      typeof embeddedError._links === "object" &&
      embeddedError._links !== null &&
      "about" in embeddedError._links &&
      typeof embeddedError._links.about === "object" &&
      embeddedError._links.about !== null &&
      "href" in embeddedError._links.about &&
      typeof embeddedError._links.about.href === "string"
    ) {
      return embeddedError._links.about.href;
    }
  }

  return null;
};

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions,
) => {
  try {
    return await dwollaClient
      .post(`customers/${options.customerId}/funding-sources`, {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
      })
      .then((res) => res.headers.get("location"));
  } catch (err) {
    console.error("Creating a Funding Source Failed: ", err);
  }
};

export const createOnDemandAuthorization = async () => {
  try {
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations",
    );
    const authLink = onDemandAuthorization.body._links;
    return authLink;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
  }
};

export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams,
) => {
  try {
    return await dwollaClient
      .post("customers", newCustomer)
      .then((res) => res.headers.get("location"));
  } catch (err) {
    const duplicateCustomerHref = getDuplicateCustomerHref(err);
    if (duplicateCustomerHref) {
      return duplicateCustomerHref;
    }
    console.error("Creating a Dwolla Customer Failed: ", err);
  }
};

export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  try {
    const requestBody = {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: amount,
      },
    };
    return await dwollaClient
      .post("transfers", requestBody)
      .then((res) => res.headers.get("location"));
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    // create dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // add funding source to the dwolla customer & get the funding source url
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};
