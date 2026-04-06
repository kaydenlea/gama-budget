import { readRequiredFunctionEnv } from "./env.ts";

export class PlaidApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly plaidErrorCode: string | null = null,
    readonly plaidErrorType: string | null = null,
  ) {
    super(message);
  }
}

export type PlaidConfig = {
  clientId: string;
  secret: string;
  baseUrl: string;
  clientName: string;
  countryCodes: string[];
  products: string[];
  language: string;
  redirectUri: string | null;
};

export type PlaidLinkTokenCreateResponse = {
  link_token: string;
  expiration: string;
  request_id: string;
};

export type PlaidPublicTokenExchangeResponse = {
  access_token: string;
  item_id: string;
  request_id: string;
};

export type PlaidItemGetResponse = {
  item: {
    item_id: string;
    institution_id: string | null;
    available_products: string[];
    billed_products: string[];
    products: string[];
    consent_expiration_time?: string | null;
    error?: {
      error_code?: string | null;
      error_type?: string | null;
      error_message?: string | null;
    } | null;
  };
  request_id: string;
};

export type PlaidAccountsGetResponse = {
  accounts: Array<{
    account_id: string;
    balances: {
      available: number | null;
      current: number | null;
      iso_currency_code?: string | null;
      unofficial_currency_code?: string | null;
    };
    mask?: string | null;
    name: string;
    official_name?: string | null;
    subtype?: string | null;
    type?: string | null;
  }>;
  item: {
    item_id: string;
    institution_id: string | null;
  };
  request_id: string;
};

export type PlaidInstitutionGetByIdResponse = {
  institution: {
    institution_id: string;
    name: string;
  };
  request_id: string;
};

export type PlaidTransaction = {
  transaction_id: string;
  account_id: string;
  amount: number;
  iso_currency_code?: string | null;
  unofficial_currency_code?: string | null;
  date: string;
  authorized_datetime?: string | null;
  authorized_date?: string | null;
  pending: boolean;
  pending_transaction_id?: string | null;
  merchant_name?: string | null;
  name: string;
  personal_finance_category?: {
    primary?: string | null;
    detailed?: string | null;
  } | null;
  category?: string[] | null;
};

export type PlaidTransactionsSyncResponse = {
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: Array<{
    transaction_id: string;
    account_id: string;
  }>;
  has_more: boolean;
  next_cursor: string;
  request_id: string;
};

function readCsvEnv(name: string, fallback: string): string[] {
  const raw = Deno.env.get(name)?.trim() || fallback;
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readPlaidBaseUrl(): string {
  const plaidEnv = readRequiredFunctionEnv("PLAID_ENV");

  switch (plaidEnv) {
    case "sandbox":
      return "https://sandbox.plaid.com";
    case "development":
      return "https://development.plaid.com";
    case "production":
      return "https://production.plaid.com";
    default:
      throw new Error(`Unsupported PLAID_ENV value: ${plaidEnv}`);
  }
}

export function readPlaidConfig(): PlaidConfig {
  return {
    clientId: readRequiredFunctionEnv("PLAID_CLIENT_ID"),
    secret: readRequiredFunctionEnv("PLAID_SECRET"),
    baseUrl: readPlaidBaseUrl(),
    clientName: Deno.env.get("PLAID_CLIENT_NAME")?.trim() || "PocketCurb Dev",
    countryCodes: readCsvEnv("PLAID_COUNTRY_CODES", "US"),
    products: readCsvEnv("PLAID_PRODUCTS", "transactions"),
    language: Deno.env.get("PLAID_LANGUAGE")?.trim() || "en",
    redirectUri: Deno.env.get("PLAID_REDIRECT_URI")?.trim() || null
  };
}

export async function postPlaid<TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const config = readPlaidConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      client_id: config.clientId,
      secret: config.secret,
      ...body
    })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error_message === "string" && payload.error_message.trim()
        ? payload.error_message.trim()
        : `Plaid request failed for ${path}`;

    throw new PlaidApiError(
      message,
      response.status,
      payload && typeof payload.error_code === "string" ? payload.error_code : null,
      payload && typeof payload.error_type === "string" ? payload.error_type : null,
    );
  }

  return payload as TResponse;
}
