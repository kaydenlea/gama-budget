import type { PropsWithChildren } from "react";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SiteContainer({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  return <div className={joinClasses("site-shell", className)}>{children}</div>;
}

export function SiteSection({
  eyebrow,
  title,
  lede,
  children,
  className
}: PropsWithChildren<{ eyebrow: string; title: string; lede?: string; className?: string }>) {
  return (
    <section className={joinClasses("site-panel px-6 py-6 md:px-8 md:py-8", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-teal)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl text-[var(--color-ink)] md:text-4xl">{title}</h2>
      {lede ? <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)] md:text-base">{lede}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function SurfaceCard({
  children,
  className,
  tone = "default"
}: PropsWithChildren<{ className?: string; tone?: "default" | "mist" }>) {
  const toneClass =
    tone === "mist"
      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(238,244,239,0.92)_100%)]"
      : "bg-[var(--color-surface)]";

  return <div className={joinClasses("site-panel px-6 py-6 md:px-7 md:py-7", toneClass, className)}>{children}</div>;
}

export function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[var(--color-line)]/80 bg-white/85 px-4 py-3 shadow-[0_12px_30px_rgba(17,32,51,0.06)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  );
}
