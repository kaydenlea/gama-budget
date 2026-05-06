"use client";

import { useId, useMemo, useState, type FormEvent } from "react";

type SubmissionState =
  | "idle"
  | "submitting"
  | "accepted"
  | "acceptedEmailFailed"
  | "duplicate"
  | "invalid"
  | "unavailable"
  | "error";

type WaitlistSignupFormProps = {
  expectations: readonly string[];
};

const personaOptions = [
  { value: "", label: "Choose a context" },
  { value: "solo", label: "Solo" },
  { value: "partnered", label: "Partnered" },
  { value: "household", label: "Shared household" },
  { value: "advisor", label: "Advisor or money helper" },
  { value: "other", label: "Other" },
];

export function WaitlistSignupForm({ expectations }: WaitlistSignupFormProps) {
  const formId = useId();
  const [state, setState] = useState<SubmissionState>("idle");

  const message = useMemo(() => {
    if (state === "accepted") {
      return "You're on the list. Check your inbox for the confirmation email.";
    }

    if (state === "duplicate") {
      return "That email is already on the list. You're all set.";
    }

    if (state === "acceptedEmailFailed") {
      return "You're on the list, but the confirmation email did not send.";
    }

    if (state === "invalid") {
      return "Check the required fields and consent checkbox, then try again.";
    }

    if (state === "unavailable") {
      return "The waitlist is temporarily unavailable. Please try again later.";
    }

    if (state === "error") {
      return "Something went wrong before the signup could be submitted.";
    }

    return "Join for product updates, alpha access, and optional research invitations tied to the waitlist.";
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const website = String(formData.get("website") ?? "").trim();

    const payload = {
      email: String(formData.get("email") ?? ""),
      firstName: optionalString(formData.get("firstName")),
      persona: optionalString(formData.get("persona")),
      biggestPain: optionalString(formData.get("biggestPain")),
      referralSource: "waitlist-page",
      marketingConsent: formData.get("marketingConsent") === "on",
      website,
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as {
        status?: string;
        error?: string;
      } | null;

      if (response.ok && body?.status === "accepted") {
        setState("accepted");
        form.reset();
        return;
      }

      if (response.ok && body?.status === "accepted_email_failed") {
        setState("acceptedEmailFailed");
        form.reset();
        return;
      }

      if (response.ok && body?.status === "duplicate") {
        setState("duplicate");
        form.reset();
        return;
      }

      if (response.status === 400) {
        setState("invalid");
        return;
      }

      if (response.status === 429 || response.status === 502 || response.status === 503) {
        setState("unavailable");
        return;
      }

      setState("error");
    } catch {
      setState("error");
    }
  }

  const isSubmitting = state === "submitting";
  const isSuccess = state === "accepted" || state === "acceptedEmailFailed" || state === "duplicate";
  const messageTone = isSuccess ? "text-[var(--color-teal)]" : "text-[var(--color-muted)]";

  return (
    <div className="glimpse-float-card">
      <p className="site-kicker">Join early access</p>
      <h3 className="mt-4 text-3xl font-semibold leading-tight text-[var(--color-ink)]">
        Join the Gama waitlist.
      </h3>
      <p className={`mt-3 text-sm leading-6 md:text-base ${messageTone}`} aria-live="polite">
        {message}
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <input autoComplete="off" className="hidden" name="website" tabIndex={-1} type="text" />

        <div className="grid gap-2">
          <label
            className="text-sm font-semibold text-[var(--color-ink)]"
            htmlFor={`${formId}-email`}
          >
            Email
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-[1.2rem] border border-[var(--color-line)]/80 bg-white/90 px-4 py-3 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-teal)]"
            disabled={isSubmitting}
            id={`${formId}-email`}
            maxLength={254}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-[var(--color-ink)]"
              htmlFor={`${formId}-first-name`}
            >
              First name
            </label>
            <input
              autoComplete="given-name"
              className="w-full rounded-[1.2rem] border border-[var(--color-line)]/80 bg-white/90 px-4 py-3 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-teal)]"
              disabled={isSubmitting}
              id={`${formId}-first-name`}
              maxLength={80}
              name="firstName"
              placeholder="Optional"
              type="text"
            />
          </div>

          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-[var(--color-ink)]"
              htmlFor={`${formId}-persona`}
            >
              Context
            </label>
            <select
              className="w-full rounded-[1.2rem] border border-[var(--color-line)]/80 bg-white/90 px-4 py-3 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-teal)]"
              disabled={isSubmitting}
              id={`${formId}-persona`}
              name="persona"
            >
              {personaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-semibold text-[var(--color-ink)]"
            htmlFor={`${formId}-biggest-pain`}
          >
            What should Gama help with first?
          </label>
          <textarea
            className="min-h-28 w-full resize-y rounded-[1.2rem] border border-[var(--color-line)]/80 bg-white/90 px-4 py-3 text-base leading-7 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-teal)]"
            disabled={isSubmitting}
            id={`${formId}-biggest-pain`}
            maxLength={280}
            name="biggestPain"
            placeholder="Safe-to-Spend, shared reimbursements, cash-flow pressure, events..."
          />
        </div>

        <label className="flex gap-3 rounded-[1.2rem] border border-[var(--color-line)]/75 bg-white/80 px-4 py-4 text-sm leading-6 text-[var(--color-muted)]">
          <input
            className="mt-1 size-4 shrink-0 accent-[var(--color-teal)]"
            disabled={isSubmitting}
            name="marketingConsent"
            required
            type="checkbox"
          />
          <span>I agree to receive Gama waitlist updates and related product follow-up.</span>
        </label>

        <button
          className="site-link w-full justify-center disabled:cursor-wait disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Joining..." : "Join waitlist"}
        </button>
      </form>

      <ul className="waitlist-form-expectations">
        {expectations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}
