import type { CSSProperties, ReactNode } from "react";
import { buildCanonicalUrl, siteConfig } from "../lib/site-config";

const logoUrl = buildCanonicalUrl("/icon.png");

const icons = {
  dining: "\uD83C\uDF74",
  travel: "\uD83D\uDE97",
  shopping: "\uD83D\uDED2",
  home: "\uD83C\uDFE0",
  coffee: "\u2615",
  plane: "\u2708",
  tv: "\uD83D\uDCFA",
  fitness: "\uD83D\uDCAA",
  sushi: "\uD83C\uDF63"
} as const;

const eventImages = {
  dateNight:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA6L7nZ1OcDxaCoF2jFrNhkBztoURLP4wMjOk4CZJwP8rFlpEd7VeHIzxh8rvyCucy7tX_BghnLgPEEdC9cp2bawHjY8enAPdYSqF04c3YOzFxgVzqDcpYvAYKfqASwGywJibOUV6iURhfaExF2yDDnLhOEJMEGrkXDPgW4FB4DM_TKkZggTLORyUgdX4xn0G49HrsUaf4x-LGWlNOj93sy_QxoBbMCPpyQ4DccESj77vOUpVeZIYjyJYJc20KYy41JVG34ncReoZDI",
  japanTrip:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD6JPiehLdolYJGnj_3S9vm0TiuSH93Pff3B7rkoK7LhAev1q22M0stGG7Zs8XzCEn5G5GXuR-_slA5rAPagyuIF6SytiIWlOqjPDNdiRH5o-9aAqA_uA3llcFKsAHSyC2xpNjz1hhgatxmRMFlLYM_BJdJ3wOG1fECOYQgpTF-vxfCwC4THF9khsJ_dECN6tw6tUiiH42I38c4kiYBBnSSjedG1QBOrFRXOAcasSDzoovxXAXOlgOtAIHuJ1Z_sPjYZCVLpwj9w7ji"
} as const;

const colors = {
  white: "#f7fbff",
  whiteSoft: "rgba(247, 251, 255, 0.78)",
  ink: "#112033",
  inkSoft: "rgba(17, 32, 51, 0.54)",
  sheet: "#f2f5f7",
  sheetCard: "#ffffff",
  green: "#74c44c",
  greenText: "#4b8d36",
  amberText: "#9f6a16"
} as const;

function Text({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: "flex", ...style }}>{children}</div>;
}

function Shell({ children, style }: { children: ReactNode; style: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "30px",
        background: "linear-gradient(180deg, rgba(17, 32, 51, 0.95), rgba(12, 23, 35, 0.98))",
        boxShadow: "0 28px 64px rgba(0, 0, 0, 0.24)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function ViewAllButton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Text style={{ fontSize: "10px", fontWeight: 700, color: "rgba(17,32,51,0.56)" }}>View All</Text>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
          borderRadius: "999px",
          background: "rgba(32,52,75,0.08)",
          color: colors.ink,
          fontSize: "11px",
          fontWeight: 800
        }}
      >
        {">"}
      </div>
    </div>
  );
}

function AmountPill({
  value,
  bg,
  dot,
  text
}: {
  value: string;
  bg: string;
  dot: string;
  text: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "8px 12px",
        borderRadius: "999px",
        background: bg
      }}
    >
      <div style={{ display: "flex", width: "6px", height: "6px", borderRadius: "999px", background: dot }} />
      <Text style={{ fontSize: "11px", lineHeight: 1, fontWeight: 800, color: text }}>{value}</Text>
    </div>
  );
}

function BudgetPill({
  icon,
  value,
  fillWidth,
  fill
}: {
  icon: string;
  value: string;
  fillWidth: string;
  fill: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "36px",
        minWidth: "72px",
        borderRadius: "999px",
        overflow: "hidden",
        background: "#eef3f8",
        border: "1px solid rgba(160,174,192,0.22)",
        boxShadow: "0 4px 12px rgba(32,52,75,0.06)"
      }}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          left: 0,
          top: 0,
          bottom: 0,
          width: fillWidth,
          background: fill
        }}
      />
      <Text
        style={{
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          width: "30px",
          height: "100%",
          fontSize: "14px"
        }}
      >
        {icon}
      </Text>
      <Text style={{ position: "relative", paddingLeft: "2px", fontSize: "11px", fontWeight: 800, color: colors.ink }}>
        {value}
      </Text>
    </div>
  );
}

function Badge({
  label,
  color,
  background
}: {
  label: string;
  color: string;
  background: string;
}) {
  return (
    <Text
      style={{
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
        padding: "3px 7px",
        borderRadius: "999px",
        fontSize: "8px",
        fontWeight: 800,
        color,
        background
      }}
    >
      {label}
    </Text>
  );
}

function RecentRow({
  icon,
  merchant,
  category,
  categoryColor,
  categoryBackground,
  amount,
  event,
  eventColor,
  eventBackground
}: {
  icon: string;
  merchant: string;
  category: string;
  categoryColor: string;
  categoryBackground: string;
  amount: string;
  event: string;
  eventColor: string;
  eventBackground: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "18px",
        background: colors.sheetCard,
        border: "1px solid rgba(17,32,51,0.05)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Text
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            background: "#f7f9fb",
            fontSize: "16px"
          }}
        >
          {icon}
        </Text>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Text style={{ fontSize: "12px", fontWeight: 800, color: colors.ink }}>{merchant}</Text>
          <div style={{ display: "flex", marginTop: "1px" }}>
            <Badge label={category} color={categoryColor} background={categoryBackground} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
        <Text style={{ fontSize: "15px", fontWeight: 800, color: colors.ink }}>{amount}</Text>
        <Badge label={event} color={eventColor} background={eventBackground} />
      </div>
    </div>
  );
}

function BillsRow({
  icon,
  merchant,
  badge,
  due,
  amount
}: {
  icon: string;
  merchant: string;
  badge: string;
  due: string;
  amount: string;
}) {
  const badgeColor = badge === "ENT" ? "#d04b45" : badge === "FIT" ? "#d46b1a" : "#4479ae";
  const badgeBg =
    badge === "ENT" ? "rgba(239,68,68,0.12)" : badge === "FIT" ? "rgba(249,115,22,0.12)" : "rgba(76,145,215,0.12)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "18px",
        background: colors.sheetCard,
        border: "1px solid rgba(17,32,51,0.05)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Text
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "14px",
            background: "#f4f7fa",
            fontSize: "16px"
          }}
        >
          {icon}
        </Text>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Text style={{ fontSize: "12px", fontWeight: 800, color: colors.ink }}>{merchant}</Text>
            <Text
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 5px",
                borderRadius: "6px",
                fontSize: "6px",
                fontWeight: 800,
                color: badgeColor,
                background: badgeBg
              }}
            >
              {badge}
            </Text>
          </div>
          <Text style={{ fontSize: "9px", fontWeight: 700, color: colors.inkSoft }}>{due}</Text>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
        <Text style={{ fontSize: "12px", fontWeight: 800, color: colors.ink }}>{amount}</Text>
        <div
          style={{
            display: "flex",
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: due.includes("Paid") ? colors.green : "#f59e0b"
          }}
        />
      </div>
    </div>
  );
}

function EventCard({
  image,
  date,
  title,
  badge,
  badgeColor,
  badgeBg,
  statA,
  statB,
  total
}: {
  image: string;
  date: string;
  title: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  statA: string;
  statB: string;
  total: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "20px",
        background: colors.sheetCard,
        border: "1px solid rgba(17,32,51,0.05)",
        width: "100%"
      }}
    >
      <img
        src={image}
        alt={title}
        width={999}
        height={64}
        style={{ display: "flex", width: "100%", height: "64px", objectFit: "cover" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "8px",
          padding: "10px 11px 10px"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          <Text style={{ fontSize: "8px", fontWeight: 800, color: colors.inkSoft }}>{date}</Text>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Text style={{ fontSize: "11px", fontWeight: 800, color: colors.ink }}>{title}</Text>
            <Text
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 6px",
                borderRadius: "999px",
                fontSize: "5px",
                fontWeight: 800,
                color: badgeColor,
                background: badgeBg
              }}
            >
              {badge}
            </Text>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <Text
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: "3px 6px",
                borderRadius: "999px",
                background: "#f8f9fa",
                fontSize: "6px",
                fontWeight: 700,
                color: "#64748b"
              }}
            >
              {statA}
            </Text>
            <Text
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: "3px 6px",
                borderRadius: "999px",
                background: "#f8f9fa",
                fontSize: "6px",
                fontWeight: 700,
                color: "#64748b"
              }}
            >
              {statB}
            </Text>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <Text style={{ fontSize: "13px", fontWeight: 800, color: colors.ink }}>{total}</Text>
          <Text style={{ fontSize: "6px", fontWeight: 700, color: "rgba(17,32,51,0.32)" }}>TOTAL SPENT</Text>
        </div>
      </div>
    </div>
  );
}

function OverviewCard() {
  return (
    <Shell
      style={{
        top: "42px",
        left: "618px",
        width: "344px",
        height: "548px",
        transform: "rotate(0deg)"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "18px 22px 14px",
          height: "256px",
          background: "linear-gradient(180deg, #112033 0%, #162738 100%)",
          color: colors.white
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <Text style={{ fontSize: "9px", fontWeight: 800, color: "rgba(247,251,255,0.54)" }}>Safe to Spend</Text>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <Text style={{ fontSize: "31px", lineHeight: 1, fontWeight: 800 }}>$42.10</Text>
              <Text style={{ fontSize: "10px", color: "rgba(247,251,255,0.34)", fontWeight: 700 }}>/ $65.00</Text>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 11px",
              borderRadius: "999px",
              background: "rgba(116,196,76,0.14)"
            }}
          >
            <div style={{ display: "flex", width: "6px", height: "6px", borderRadius: "999px", background: colors.white }} />
            <Text style={{ fontSize: "10px", fontWeight: 800, color: colors.white }}>$268 under</Text>
          </div>
        </div>

        <div style={{ display: "flex", height: "104px", marginTop: "2px", marginBottom: "8px" }}>
          <svg viewBox="-8 0 216 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="social-overview-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.18)" />
                <stop offset="40%" stopColor="rgba(245, 158, 11, 0.18)" />
                <stop offset="60%" stopColor="rgba(16, 185, 129, 0.18)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
              </linearGradient>
              <linearGradient id="social-overview-line" x1="0" x2="0" y1="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="45%" stopColor="#10b981" />
                <stop offset="68%" stopColor="#f59e0b" />
                <stop offset="86%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path d="M 0 95 C 24 85, 46 105, 74 75 C 98 45, 124 110, 150 65 C 176 20, 188 35, 200 15 L 200 100 L 0 100 Z" fill="url(#social-overview-area)" />
            <path d="M 0 95 C 24 85, 46 105, 74 75 C 98 45, 124 110, 150 65 C 176 20, 188 35, 200 15" fill="none" stroke="url(#social-overview-line)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="200" cy="15" r="4" fill="#ef4444" stroke="#112033" strokeWidth="2.4" />
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              minHeight: "28px",
              padding: "6px 10px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.06)"
            }}
          >
            <div style={{ display: "flex", width: "6px", height: "6px", borderRadius: "999px", background: "rgba(247,251,255,0.72)" }} />
            <Text style={{ fontSize: "9px", fontWeight: 800, color: "rgba(247,251,255,0.8)" }}>PAYDAY IN 3D</Text>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              minHeight: "28px",
              padding: "1px",
              borderRadius: "999px",
              background: "rgba(0,0,0,0.24)"
            }}
          >
            {["Day", "Week", "Month"].map((label, index) => (
              <Text
                key={label}
                style={{
                  minHeight: "26px",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 12px",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: 800,
                  color: index === 0 ? colors.white : "rgba(247,251,255,0.34)",
                  background: index === 0 ? "rgba(255,255,255,0.08)" : "transparent"
                }}
              >
                {label}
              </Text>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, padding: "18px 18px 20px", background: colors.sheet }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "15px 16px",
            marginTop: "-38px",
            borderRadius: "28px",
            background: colors.sheetCard,
            boxShadow: "0 20px 40px rgba(17,32,51,0.1)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: "9px", fontWeight: 800, color: "rgba(17,32,51,0.38)" }}>Budgets</Text>
            <ViewAllButton />
          </div>
          <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "8px", width: "302px" }}>
              <BudgetPill icon={icons.dining} value="$114" fillWidth="80%" fill="rgba(116,196,76,0.32)" />
              <BudgetPill icon={icons.travel} value="$75" fillWidth="60%" fill="rgba(245,158,11,0.3)" />
              <BudgetPill icon={icons.shopping} value="$12" fillWidth="95%" fill="rgba(229,111,106,0.3)" />
              <BudgetPill icon={icons.home} value="$450" fillWidth="40%" fill="rgba(116,196,76,0.26)" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px" }}>
          <Text style={{ fontSize: "10px", fontWeight: 800, color: "rgba(17,32,51,0.4)" }}>Recent</Text>
          <Text
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 10px",
              borderRadius: "999px",
              background: "rgba(116,196,76,0.18)",
              fontSize: "8px",
              fontWeight: 800,
              color: colors.greenText
            }}
          >
            2 New
          </Text>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <RecentRow
            icon={icons.travel}
            merchant="Uber"
            category="Travel"
            categoryColor="#4479ae"
            categoryBackground="rgba(76,145,215,0.1)"
            amount="$18.40"
            event={`${icons.plane} Japan Trip`}
            eventColor="#4479ae"
            eventBackground="rgba(76,145,215,0.1)"
          />
          <RecentRow
            icon={icons.coffee}
            merchant="Starbucks"
            category="Dining"
            categoryColor={colors.greenText}
            categoryBackground="rgba(116,196,76,0.1)"
            amount="$4.50"
            event={`${icons.coffee} Morning Coffee`}
            eventColor="#c26a12"
            eventBackground="rgba(245,158,11,0.1)"
          />
        </div>
      </div>
    </Shell>
  );
}

function BillsCard() {
  return (
    <Shell
      style={{
        top: "294px",
        left: "454px",
        width: "264px",
        height: "228px",
        borderRadius: "24px",
        transform: "rotate(0deg)"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, padding: "16px", background: colors.sheet }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: "10px", fontWeight: 800, color: "rgba(17,32,51,0.42)" }}>Upcoming</Text>
          <AmountPill value="$763.99" bg="rgba(245,158,11,0.14)" dot="#f59e0b" text={colors.amberText} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <BillsRow icon={icons.tv} merchant="Netflix" badge="ENT" due="Due in 2 days" amount="$19.99" />
          <BillsRow icon={icons.fitness} merchant="Equinox" badge="FIT" due="Due in 4 days" amount="$245.00" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
          <Text style={{ fontSize: "10px", fontWeight: 800, color: "rgba(17,32,51,0.42)" }}>Settled</Text>
          <AmountPill value="$2,154.99" bg="rgba(116,196,76,0.14)" dot={colors.green} text={colors.greenText} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <BillsRow icon={icons.home} merchant="Rent" badge="HOME" due="Paid Oct 1" amount="$1,850.00" />
        </div>
      </div>
    </Shell>
  );
}

function EventsCard() {
  return (
    <Shell
      style={{
        top: "78px",
        left: "900px",
        width: "264px",
        height: "282px",
        borderRadius: "22px",
        transform: "rotate(0deg)"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
          padding: "14px 14px 10px",
          background: colors.sheet,
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: "10px", fontWeight: 800, color: "rgba(17,32,51,0.42)" }}>Events Timeline</Text>
          <ViewAllButton />
        </div>
        <div style={{ position: "relative", display: "flex", flex: 1, gap: "8px", overflow: "hidden" }}>
          <div style={{ position: "relative", display: "flex", width: "24px", flexShrink: 0 }}>
            <div
              style={{
                position: "absolute",
                left: "11px",
                top: "10px",
                bottom: "0px",
                width: "2px",
                borderRadius: "999px",
                background: "rgba(32,52,75,0.12)"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "999px",
                background: "#ffe5d9",
                fontSize: "10px"
              }}
            >
              {icons.dining}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "146px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "999px",
                background: "#ddefff",
                fontSize: "10px"
              }}
            >
              {icons.plane}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflow: "hidden", justifyContent: "space-between" }}>
            <EventCard
              image={eventImages.dateNight}
              date="Friday, Nov 3"
              title="Date Night"
              badge="LEISURE"
              badgeColor="#d46b1a"
              badgeBg="rgba(249,115,22,0.12)"
              statA={`${icons.dining} $120.00`}
              statB={`${icons.travel} $25.50`}
              total="$185.50"
            />
            <EventCard
              image={eventImages.japanTrip}
              date="Dec 12 - Dec 24"
              title="Japan Trip"
              badge="TRAVEL"
              badgeColor="#4479ae"
              badgeBg="rgba(76,145,215,0.12)"
              statA="$850.00"
              statB="$400.00"
              total="$2,450"
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function SocialImageCard() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 18% 18%, rgba(76, 145, 215, 0.34) 0%, rgba(76, 145, 215, 0.14) 25%, rgba(76, 145, 215, 0.03) 48%, rgba(76, 145, 215, 0) 64%), radial-gradient(circle at 82% 72%, rgba(116, 196, 76, 0.24) 0%, rgba(116, 196, 76, 0.1) 25%, rgba(116, 196, 76, 0.02) 44%, rgba(116, 196, 76, 0) 58%), linear-gradient(160deg, #111d2b 0%, #16283d 42%, #172825 100%)",
        color: colors.white,
        fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
      }}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          inset: 0,
          background: "linear-gradient(90deg, rgba(19,35,53,0.12) 0%, rgba(19,35,53,0.06) 48%, rgba(19,35,53,0.02) 100%)"
        }}
      />

      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          top: "46px",
          left: "50px",
          gap: "12px"
        }}
      >
        <img
          src={logoUrl}
          alt={siteConfig.name}
          width={56}
          height={56}
          style={{ display: "flex", borderRadius: "16px", boxShadow: "0 14px 32px rgba(0, 0, 0, 0.18)" }}
        />
        <Text style={{ fontSize: "31px", lineHeight: 1, fontWeight: 900, letterSpacing: "-0.02em", color: colors.white }}>
          {siteConfig.name}
        </Text>
      </div>

      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          left: "50px",
          top: "156px",
          gap: "18px",
          width: "446px"
        }}
      >
        <Text
          style={{
            fontSize: "58px",
            lineHeight: 0.98,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: colors.white,
            maxWidth: "430px"
          }}
        >
          Budget what matters, not just the month.
        </Text>
        <Text
          style={{
            maxWidth: "378px",
            fontSize: "20px",
            lineHeight: 1.42,
            fontWeight: 700,
            color: colors.whiteSoft
          }}
        >
          Safe to spend, budget posture, bills, and event context in one calm, decision-first view.
        </Text>
      </div>

      <OverviewCard />
      <BillsCard />
      <EventsCard />
    </div>
  );
}
