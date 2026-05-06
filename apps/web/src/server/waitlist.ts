import { waitlistSignupSchema, type WaitlistSignup } from "@gama/schemas";

type RuntimeEnv = Record<string, string | undefined>;

export type WaitlistRuntimeConfig = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  resendApiKey: string;
  waitlistFromEmail: string;
  waitlistNotifyEmail: string;
};

export type WaitlistRequestContext = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type WaitlistSubmissionOutcome =
  | { status: "accepted" }
  | { status: "accepted_email_failed" }
  | { status: "duplicate" };

type WaitlistStoredSignup = {
  confirmationEmailSentAt: string | null;
  email: string;
  notificationEmailSentAt: string | null;
};

type WaitlistEmailMessage = {
  html: string;
  sentAtColumn: "confirmation_email_sent_at" | "notification_email_sent_at";
  subject: string;
  to: string;
};

type WaitlistStorageOutcome =
  | { status: "accepted"; storedSignup: WaitlistStoredSignup }
  | { status: "duplicate"; storedSignup: WaitlistStoredSignup };

export class WaitlistConfigurationError extends Error {
  constructor(message = "Waitlist backend is not configured.") {
    super(message);
    this.name = "WaitlistConfigurationError";
  }
}

export class WaitlistStorageError extends Error {
  constructor(message = "Waitlist signup could not be stored.") {
    super(message);
    this.name = "WaitlistStorageError";
  }
}

export class WaitlistEmailError extends Error {
  constructor(
    message = "Waitlist email could not be sent.",
    readonly details?: {
      recipient?: string;
      responseBody?: string;
      status?: number;
      subject?: string;
    }
  ) {
    super(message);
    this.name = "WaitlistEmailError";
  }
}

export type WaitlistDependencies = {
  fetch: typeof fetch;
  logger?: Pick<typeof console, "error">;
  now: () => Date;
};

const supabaseServiceRoleEnvKey = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");
const waitlistRateLimitWindowMs = 10 * 60 * 1000;
const waitlistRateLimitMaxSubmissions = 5;
const waitlistRateLimitBuckets = new Map<string, number[]>();

const requiredEnvKeys = [
  "SUPABASE_URL",
  supabaseServiceRoleEnvKey,
  "RESEND_API_KEY",
  "WAITLIST_FROM_EMAIL",
  "WAITLIST_NOTIFY_EMAIL"
] as const;

export function readWaitlistRuntimeConfig(env: RuntimeEnv = process.env): WaitlistRuntimeConfig {
  const missing = requiredEnvKeys.filter((key) => !env[key]?.trim());

  if (missing.length > 0) {
    throw new WaitlistConfigurationError(`Missing waitlist env: ${missing.join(", ")}`);
  }

  return {
    supabaseUrl: env.SUPABASE_URL!.replace(/\/$/, ""),
    supabaseServiceRoleKey: env[supabaseServiceRoleEnvKey]!,
    resendApiKey: env.RESEND_API_KEY!,
    waitlistFromEmail: env.WAITLIST_FROM_EMAIL!,
    waitlistNotifyEmail: env.WAITLIST_NOTIFY_EMAIL!
  };
}

export type WaitlistRateLimitInput = {
  email?: string | null;
  ipAddress?: string | null;
  nowMs?: number;
};

export type WaitlistRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkWaitlistRateLimit(input: WaitlistRateLimitInput): WaitlistRateLimitResult {
  const nowMs = input.nowMs ?? Date.now();
  const keys = buildWaitlistRateLimitKeys(input);
  const oldestAllowedMs = nowMs - waitlistRateLimitWindowMs;

  for (const key of keys) {
    const recentHits = (waitlistRateLimitBuckets.get(key) ?? []).filter((hitMs) => hitMs > oldestAllowedMs);

    if (recentHits.length >= waitlistRateLimitMaxSubmissions) {
      waitlistRateLimitBuckets.set(key, recentHits);

      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((recentHits[0]! + waitlistRateLimitWindowMs - nowMs) / 1000))
      };
    }
  }

  for (const key of keys) {
    const recentHits = (waitlistRateLimitBuckets.get(key) ?? []).filter((hitMs) => hitMs > oldestAllowedMs);
    waitlistRateLimitBuckets.set(key, [...recentHits, nowMs]);
  }

  return { allowed: true };
}

export function resetWaitlistRateLimitForTests(): void {
  waitlistRateLimitBuckets.clear();
}

export async function submitWaitlistSignup(
  input: unknown,
  context: WaitlistRequestContext,
  config: WaitlistRuntimeConfig,
  dependencies: WaitlistDependencies = { fetch, now: () => new Date() }
): Promise<WaitlistSubmissionOutcome> {
  const signup = waitlistSignupSchema.parse(input);
  const submittedAt = dependencies.now().toISOString();

  const storageOutcome = await storeWaitlistSignup(signup, context, submittedAt, config, dependencies);

  const emailMessages = buildWaitlistEmailMessages(signup, config, storageOutcome.storedSignup);

  if (storageOutcome.status === "duplicate" && emailMessages.length === 0) {
    return { status: "duplicate" };
  }

  try {
    await sendWaitlistEmails(signup.email, emailMessages, config, dependencies);
  } catch (error) {
    const logger = dependencies.logger ?? console;

    logger.error("Waitlist signup stored, but email delivery failed.", {
      email: signup.email,
      error: error instanceof Error ? error.message : error,
      ...(error instanceof WaitlistEmailError && error.details ? { emailFailure: error.details } : {})
    });

    return { status: "accepted_email_failed" };
  }

  return { status: storageOutcome.status };
}

function buildWaitlistRateLimitKeys(input: WaitlistRateLimitInput): string[] {
  const keys = new Set<string>();
  const ipAddress = input.ipAddress?.trim();
  const email = input.email?.trim().toLowerCase();

  keys.add(`ip:${ipAddress || "unknown"}`);

  if (email) {
    keys.add(`email:${email}`);
  }

  return Array.from(keys);
}

async function storeWaitlistSignup(
  signup: WaitlistSignup,
  context: WaitlistRequestContext,
  submittedAt: string,
  config: WaitlistRuntimeConfig,
  dependencies: WaitlistDependencies
): Promise<WaitlistStorageOutcome> {
  const requestInit = {
    method: "POST",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify({
      email: signup.email,
      first_name: signup.firstName ?? null,
      persona: signup.persona ?? null,
      biggest_pain: signup.biggestPain ?? null,
      referral_source: signup.referralSource ?? null,
      marketing_consent: signup.marketingConsent,
      submitted_at: submittedAt,
      user_agent: context.userAgent ?? null,
      ip_address: context.ipAddress ?? null
    })
  } as const;

  let response: Response;

  try {
    response = await dependencies.fetch(`${config.supabaseUrl}/rest/v1/waitlist_signups`, requestInit);
  } catch {
    throw new WaitlistStorageError();
  }

  if (response.ok) {
    return {
      status: "accepted",
      storedSignup: await readStoredSignupFromWriteResponse(response)
    };
  }

  if (response.status === 409) {
    return {
      status: "duplicate",
      storedSignup: await readExistingWaitlistSignup(signup.email, config, dependencies)
    };
  }

  throw new WaitlistStorageError();
}

async function readStoredSignupFromWriteResponse(response: Response): Promise<WaitlistStoredSignup> {
  let body: unknown;

  try {
    body = (await response.json()) as unknown;
  } catch {
    throw new WaitlistStorageError();
  }

  if (!Array.isArray(body) || body.length !== 1) {
    throw new WaitlistStorageError();
  }

  return parseStoredSignup(body[0]);
}

async function readExistingWaitlistSignup(
  email: string,
  config: WaitlistRuntimeConfig,
  dependencies: WaitlistDependencies
): Promise<WaitlistStoredSignup> {
  const params = new URLSearchParams({
    select: "email,confirmation_email_sent_at,notification_email_sent_at",
    email: `eq.${email}`,
    limit: "1"
  });

  let response: Response;

  try {
    response = await dependencies.fetch(`${config.supabaseUrl}/rest/v1/waitlist_signups?${params.toString()}`, {
      method: "GET",
      headers: {
        apikey: config.supabaseServiceRoleKey,
        authorization: `Bearer ${config.supabaseServiceRoleKey}`
      }
    });
  } catch {
    throw new WaitlistStorageError();
  }

  if (!response.ok) {
    throw new WaitlistStorageError();
  }

  let body: unknown;

  try {
    body = (await response.json()) as unknown;
  } catch {
    throw new WaitlistStorageError();
  }

  if (!Array.isArray(body) || body.length !== 1) {
    throw new WaitlistStorageError();
  }

  return parseStoredSignup(body[0]);
}

function parseStoredSignup(value: unknown): WaitlistStoredSignup {
  if (!value || typeof value !== "object") {
    throw new WaitlistStorageError();
  }

  const maybeStored = value as Record<string, unknown>;
  const email = maybeStored.email;
  const confirmationEmailSentAt = maybeStored.confirmation_email_sent_at;
  const notificationEmailSentAt = maybeStored.notification_email_sent_at;

  if (typeof email !== "string") {
    throw new WaitlistStorageError();
  }

  if (confirmationEmailSentAt !== null && typeof confirmationEmailSentAt !== "string") {
    throw new WaitlistStorageError();
  }

  if (notificationEmailSentAt !== null && typeof notificationEmailSentAt !== "string") {
    throw new WaitlistStorageError();
  }

  return {
    email,
    confirmationEmailSentAt,
    notificationEmailSentAt
  };
}

function buildWaitlistEmailMessages(
  signup: WaitlistSignup,
  config: WaitlistRuntimeConfig,
  storedSignup: WaitlistStoredSignup
): WaitlistEmailMessage[] {
  const messages: WaitlistEmailMessage[] = [];

  if (!storedSignup.confirmationEmailSentAt) {
    messages.push({
      to: signup.email,
      subject: "You're on the Gama waitlist",
      html: buildConfirmationEmail(signup),
      sentAtColumn: "confirmation_email_sent_at"
    });
  }

  if (!storedSignup.notificationEmailSentAt) {
    messages.push({
      to: config.waitlistNotifyEmail,
      subject: `New Gama waitlist signup: ${signup.email}`,
      html: buildInternalNotificationEmail(signup),
      sentAtColumn: "notification_email_sent_at"
    });
  }

  return messages;
}

async function sendWaitlistEmails(
  signupEmail: string,
  messages: WaitlistEmailMessage[],
  config: WaitlistRuntimeConfig,
  dependencies: WaitlistDependencies
): Promise<void> {
  for (const message of messages) {
    let response: Response;

    try {
      response = await dependencies.fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.resendApiKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          from: config.waitlistFromEmail,
          to: message.to,
          subject: message.subject,
          html: message.html
        })
      });
    } catch {
      throw new WaitlistEmailError("Waitlist email could not be sent.", {
        recipient: message.to,
        subject: message.subject
      });
    }

    if (!response.ok) {
      let responseBody = "";

      try {
        responseBody = await response.text();
      } catch {
        responseBody = "";
      }

      throw new WaitlistEmailError("Waitlist email could not be sent.", {
        recipient: message.to,
        responseBody,
        status: response.status,
        subject: message.subject
      });
    }

    await markWaitlistEmailDelivered(signupEmail, message.sentAtColumn, config, dependencies);
  }
}

async function markWaitlistEmailDelivered(
  signupEmail: string,
  sentAtColumn: WaitlistEmailMessage["sentAtColumn"],
  config: WaitlistRuntimeConfig,
  dependencies: WaitlistDependencies
): Promise<void> {
  const params = new URLSearchParams({
    email: `eq.${signupEmail}`
  });

  let response: Response;

  try {
    response = await dependencies.fetch(`${config.supabaseUrl}/rest/v1/waitlist_signups?${params.toString()}`, {
      method: "PATCH",
      headers: {
        apikey: config.supabaseServiceRoleKey,
        authorization: `Bearer ${config.supabaseServiceRoleKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        [sentAtColumn]: dependencies.now().toISOString()
      })
    });
  } catch {
    throw new WaitlistEmailError("Waitlist email delivery state could not be updated.", {
      recipient: signupEmail,
      subject: sentAtColumn
    });
  }

  if (!response.ok) {
    let responseBody = "";

    try {
      responseBody = await response.text();
    } catch {
      responseBody = "";
    }

    throw new WaitlistEmailError("Waitlist email delivery state could not be updated.", {
      recipient: signupEmail,
      responseBody,
      status: response.status,
      subject: sentAtColumn
    });
  }
}

function buildConfirmationEmail(signup: WaitlistSignup): string {
  const greeting = signup.firstName ? `Hi ${escapeHtml(signup.firstName)},` : "Hi,";

  return [
    `<p>${greeting}</p>`,
    "<p>You're on the Gama waitlist. We'll only follow up with product updates, alpha access, or research invitations tied to the waitlist.</p>",
    "<p>Thanks for helping shape a calmer way to make daily money decisions.</p>"
  ].join("");
}

function buildInternalNotificationEmail(signup: WaitlistSignup): string {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Email", value: signup.email },
    { label: "First name", value: signup.firstName ?? "" },
    { label: "Persona", value: signup.persona ?? "" },
    { label: "Biggest pain", value: signup.biggestPain ?? "" },
    { label: "Referral source", value: signup.referralSource ?? "" }
  ];

  return `<table>${rows
    .map((row) => `<tr><th align="left">${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`)
    .join("")}</table>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
