import type { MockupPreviewSlug } from "./mockup-previews";

type SiteRoute = "/";

type NavLink = {
  href: SiteRoute;
  label: string;
};

type Highlight = {
  label: string;
  value: string;
};

type BulletListSection = {
  title: string;
  items: string[];
};

type StoryScene = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  supportingLabel: string;
  metrics: Highlight[];
  previewSlug: MockupPreviewSlug;
};

type WalkthroughStep = {
  id: string;
  stepLabel: string;
  eyebrow: string;
  title: string;
  body: string;
  previewSlug: MockupPreviewSlug;
  highlights: string[];
};

type ScreenGalleryCard = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  previewSlug: MockupPreviewSlug;
  tone: "light" | "dark";
  metrics: Highlight[];
};

type MarqueeInstitution = {
  name: string;
  descriptor: string;
};

type SignatureFeatureCard = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: "timeline" | "map" | "receipt" | "share" | "story";
  previewSlug: MockupPreviewSlug;
};

type TrustCarouselSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: "privacy" | "share" | "review" | "add";
  previewSlug: MockupPreviewSlug;
};

type FooterLink = {
  href: string;
  label: string;
};

type CopyCard = {
  title: string;
  body: string;
};

type CalloutCard = CopyCard & {
  eyebrow?: string;
};

export const siteCopy = {
  navigation: [{ href: "/", label: "Home" }] as const satisfies readonly NavLink[],
  shared: {
    announcement: "Mobile-first money clarity, event context, and privacy-first trust.",
    primaryCta: { href: "#early-access", label: "Join early access" },
    secondaryCta: { href: "#trust", label: "Why privacy comes first" },
    tertiaryCta: { href: "#early-access", label: "Go to the early-access panel" },
    proofStrip: [
      { label: "Safe-to-Spend", value: "A trusted daily answer" },
      { label: "Forward-looking", value: "Cash flow before surprises" },
      { label: "Shared clarity", value: "Correct with private autonomy" },
    ] as const satisfies readonly Highlight[],
    storyScenes: [
      {
        id: "clarity",
        eyebrow: "Daily clarity",
        title: "See what is safe to spend before the week gets away from you.",
        body: "Gama is built to answer the next-step question first. Safe-to-Spend, budget posture, and upcoming pressure work together so the app feels like guidance, not bookkeeping homework.",
        supportingLabel: "Daily Spending Meter",
        metrics: [
          { label: "Today", value: "$86 safe to spend" },
          { label: "Running balance", value: "$1,420 projected" },
          { label: "Cushion", value: "$600 protected" },
        ],
        previewSlug: "cash-flow",
      },
      {
        id: "events",
        eyebrow: "Events and receipts",
        title: "Turn trips, dinners, and irregular spending into something useful.",
        body: "Instead of leaving real-life spending scattered across banking apps, notes, and group chats, Gama treats events as first-class money objects with budgets, context, and curated receipts worth revisiting.",
        supportingLabel: "Event budget and receipt",
        metrics: [
          { label: "Weekend total", value: "$428 across 14 charges" },
          { label: "Receipt", value: "Curated before sharing" },
          { label: "Places", value: "Context kept with spend" },
        ],
        previewSlug: "event-details",
      },
      {
        id: "shared",
        eyebrow: "Shared context",
        title: "Handle shared spending correctly without turning money into surveillance.",
        body: "Shared households, fronted purchases, reimbursements, and private autonomy all matter to the truth of the budget. Gama keeps those shared-spend boundaries explicit so shared context does not erase personal control.",
        supportingLabel: "Shared spending and privacy",
        metrics: [
          { label: "Shared context", value: "Visible when it matters" },
          { label: "Reimbursements", value: "Separate from overspend" },
          { label: "Privacy", value: "Explicit and previewable" },
        ],
        previewSlug: "event-details-share",
      },
    ] as const satisfies readonly StoryScene[],
    scenarios: [
      {
        title: "Trips and dinners",
        body: "Keep the budget, the places, and the recap of the event together instead of stitching them back together later.",
      },
      {
        title: "Shared households and group spend",
        body: "See the shared picture without losing private autonomy, personal context, or reimbursement accuracy.",
      },
      {
        title: "People who want less admin work",
        body: "Use a product designed to answer what changed and what is safe next, not to assign homework to every transaction.",
      },
    ] as const satisfies readonly CopyCard[],
    trustPillars: [
      {
        title: "Private by default",
        body: "Gama is not built around a public financial feed. Sharing is selective, explicit, and previewable.",
      },
      {
        title: "Honest launch posture",
        body: "The site is intentionally pre-launch. Early access is being shaped carefully instead of being treated like a generic email grab.",
      },
      {
        title: "Growth stays disclosure-safe",
        body: "Waitlist capture stays narrow, consent-led, and separate from broader analytics or growth mechanics.",
      },
    ] as const satisfies readonly CopyCard[],
  },
  home: {
    hero: {
      eyebrow: "Decision-first money clarity",
      title: "Budget what matters, not just the month.",
      body: "Safe-to-Spend, forward-looking cash flow, and shared-spend clarity for everyday spending, events, and shared plans.",
      primaryCta: { href: "#main-content", label: "Join waitlist" },
      secondaryCta: { href: "#home-trust-title", label: "See the trust stance" },
    },
    connectMarquee: {
      label: "Connect your main banks with one tap",
      institutions: [
        { name: "Chase", descriptor: "Checking" },
        { name: "Bank of America", descriptor: "Checking" },
        { name: "Wells Fargo", descriptor: "Checking" },
        { name: "Citi", descriptor: "Credit" },
        { name: "Capital One", descriptor: "Credit" },
        { name: "American Express", descriptor: "Credit" },
        { name: "Discover", descriptor: "Credit" },
        { name: "U.S. Bank", descriptor: "Banking" },
      ] as const satisfies readonly MarqueeInstitution[],
    },
    signatureFeatures: {
      eyebrow: "Budget your life moments",
      title: "Distinctive moments shown in the app itself.",
      body: "Four focused surfaces show where Gama becomes more useful than another budgeting dashboard.",
      cards: [
        {
          id: "overview-timeline",
          eyebrow: "Overview timeline",
          title: "Events stay in the daily view.",
          body: "Trips and dinners stay attached to the view you check first.",
          icon: "timeline",
          previewSlug: "overview-screen",
        },
        {
          id: "receipt-recap",
          eyebrow: "Receipts and recap",
          title: "Moments ready to share.",
          body: "Trips, dinners, and shared plans can be a polished recap.",
          icon: "share",
          previewSlug: "event-details",
        },
        {
          id: "money-stories",
          eyebrow: "Money stories",
          title: "Stories explain the shift.",
          body: "Weekly movement becomes a readable story instead of a chart.",
          icon: "story",
          previewSlug: "stories",
        },
        {
          id: "map-context",
          eyebrow: "Map context",
          title: "Place context when it matters.",
          body: "Routes and venues stay legible without turning into map clutter.",
          icon: "map",
          previewSlug: "marker-popup",
        },
      ] as const satisfies readonly SignatureFeatureCard[],
    },
    overviewStrip: [
      { label: "Safe-to-Spend", value: "A trusted answer before you spend" },
      { label: "Forward view", value: "Bills and pressure stay in frame" },
      { label: "Shared truth", value: "Reimbursements stop distorting the budget" },
    ] as const satisfies readonly Highlight[],
    walkthrough: {
      eyebrow: "Scroll the product",
      title: "One anchored device. Four money moments that explain the launch.",
      body: "The screen stays in place while the story moves through the product surfaces that make Gama feel calmer and more useful than budgeting homework.",
      steps: [
        {
          id: "accounts",
          stepLabel: "Step 1",
          eyebrow: "Connect the full picture",
          title: "Bring every account into one clean starting point.",
          body: "A search-first account flow gives the daily answer enough context to be trusted without making setup feel like a project.",
          previewSlug: "accounts",
          highlights: [
            "Search-first institution picker",
            "Built for mobile check-ins",
            "Calm setup before the money view",
          ],
        },
        {
          id: "overview",
          stepLabel: "Step 2",
          eyebrow: "Daily answer first",
          title: "See what is actually safe before the day starts pulling at you.",
          body: "Safe-to-Spend, running balance, and the daily meter sit in one view so the app answers the next decision instead of replaying the mess.",
          previewSlug: "overview-screen",
          highlights: [
            "Daily Spending Meter",
            "Running balance stays visible",
            "Designed for quick morning checks",
          ],
        },
        {
          id: "bills",
          stepLabel: "Step 3",
          eyebrow: "Forward pressure visible",
          title: "Keep bills and upcoming cash pressure in frame.",
          body: "Short-term clarity stays honest when upcoming obligations are visible early instead of turning into a surprise later in the week.",
          previewSlug: "bills",
          highlights: [
            "Upcoming bills in one rail",
            "Cash pressure stays legible",
            "Forward-looking without spreadsheet rituals",
          ],
        },
        {
          id: "cash-flow",
          stepLabel: "Step 4",
          eyebrow: "Cash flow stays clear",
          title: "See upcoming pressure before it changes the day.",
          body: "Bills, income timing, and short-term obligations stay visible together so the next decision reflects what is coming, not only what already happened.",
          previewSlug: "cash-flow",
          highlights: [
            "Upcoming obligations in view",
            "Income timing stays legible",
            "Forward-looking without spreadsheet rituals",
          ],
        },
      ] as const satisfies readonly WalkthroughStep[],
    },
    screenGallery: {
      eyebrow: "More than one hero screen",
      title: "A fuller picture of the product, without another wall of copy.",
      body: "The launch story is stronger when the site shows more of the product surfaces that make Gama feel coherent day to day.",
      cards: [
        {
          id: "stories",
          eyebrow: "Narrative intelligence",
          title: "Stories turn weekly money changes into context you can actually read.",
          body: "Instead of another chart pile, Gama can summarize what changed, why it mattered, and what deserves attention next.",
          previewSlug: "stories",
          tone: "dark",
          metrics: [
            { label: "Weekly read", value: "Changes explained plainly" },
            { label: "Context", value: "What moved and why" },
          ],
        },
        {
          id: "receipt",
          eyebrow: "Receipts and recap",
          title: "Event receipts feel curated enough to keep or share.",
          body: "A cleaner receipt surface makes irregular spending more memorable and more useful than a scattered transaction export.",
          previewSlug: "receipt",
          tone: "light",
          metrics: [
            { label: "Receipt", value: "Curated before sharing" },
            { label: "Format", value: "Designed to revisit later" },
          ],
        },
        {
          id: "transactions",
          eyebrow: "Transaction context",
          title: "Transactions stay organized without making cleanup the whole product.",
          body: "Categorized movement still matters, but it supports the decision layer instead of replacing it.",
          previewSlug: "transactions-categorized",
          tone: "light",
          metrics: [
            { label: "Grouping", value: "Readable at a glance" },
            { label: "Role", value: "Supports the next decision" },
          ],
        },
        {
          id: "review",
          eyebrow: "Low-friction correction",
          title: "Manual review stays fast when real life needs a fix.",
          body: "Editing and confirming a transaction should feel lightweight so the product stays useful even when the data is imperfect.",
          previewSlug: "review-transaction",
          tone: "light",
          metrics: [
            { label: "Editing", value: "Fast correction loop" },
            { label: "Fallback", value: "Useful when feeds miss context" },
          ],
        },
      ] as const satisfies readonly ScreenGalleryCard[],
    },
    trustBridge: {
      eyebrow: "Trust stays visible",
      title: "Trust stays visible from first sync to daily review.",
      body: "",
      slides: [
        {
          id: "setup",
          eyebrow: "Connected deliberately",
          title: "Account setup stays readable from the start.",
          body: "Search-first linking keeps the starting point explicit.",
          icon: "privacy",
          previewSlug: "accounts-trust",
        },
        {
          id: "categorised",
          eyebrow: "Sorted transparently",
          title: "Categorised movement stays easy to review.",
          body: "Movement stays visible without becoming another feed.",
          icon: "share",
          previewSlug: "transactions-categorized",
        },
        {
          id: "review",
          eyebrow: "Corrected efficiently",
          title: "Bad transaction data can be fixed before it counts.",
          body: "Review stays lightweight and explicit.",
          icon: "review",
          previewSlug: "review-transaction-trust",
        },
        {
          id: "missed",
          eyebrow: "Add missed expense",
          title: "Missed transactions can be added without breaking the flow.",
          body: "Quick add keeps cash, tips, and late memories easy to capture.",
          icon: "add",
          previewSlug: "add-transaction-trust",
        },
      ] as const satisfies readonly TrustCarouselSlide[],
      primaryCta: { href: "#home-trust-title", label: "Read the privacy stance" },
      secondaryCta: { href: "#main-content", label: "Go to early access" },
    },
  },
  waitlist: {
    hero: {
      eyebrow: "Early access",
      title: "Know what is safe to spend.",
      body: "Gama gives you short-term money clarity, then keeps trips, dinners, shared spending, and favorite places easy to revisit.",
      primaryCta: { href: "#early-access", label: "Join the early-access list" },
      secondaryCta: { href: "#early-access", label: "See how trust is handled" },
      supporting: [
        { label: "Mobile-first", value: "Built for daily check-ins" },
        { label: "Pre-launch", value: "Thoughtful rollout over hype" },
        { label: "Privacy-first", value: "No public raw-spending feed" },
      ] as const satisfies readonly Highlight[],
    },
    positioning: {
      eyebrow: "What makes Gama different",
      title: "Built for the next money decision.",
      body: "Start with Safe-to-Spend, then add events, places, and shared-spend context when it matters.",
    },
    differentiators: [
      {
        title: "Safe-to-Spend, not shame-driven tracking",
        body: "The product is designed around a trusted next-step answer and clear explanations of what changed.",
      },
      {
        title: "Forward-looking cash flow before surprises",
        body: "Bills, reimbursements, and short-term pressure should be visible before they turn into confusion.",
      },
      {
        title: "Events and places that stay useful",
        body: "Trips, dinners, and shared moments should be easier to understand, revisit, and summarize.",
      },
      {
        title: "Shared spending that keeps private autonomy intact",
        body: "Gama treats reimbursement and privacy boundaries as first-class product problems, not spreadsheet residue.",
      },
    ] as const satisfies readonly CopyCard[],
    story: {
      eyebrow: "How it fits real life",
      title: "Three product moments that define the launch story.",
      body: "The app starts with daily clarity, then makes richer money context useful through events, receipts, places, and shared spending boundaries.",
    },
    scenariosIntro: {
      eyebrow: "Who this is for",
      title: "Built for real money moments, not only neat monthly budgets.",
      body: "Gama is especially strong when everyday spending overlaps with social plans, irregular events, and shared financial context.",
    },
    trust: {
      eyebrow: "Private by default",
      title: "Sharing should be optional, explicit, and worth doing.",
      body: "Gama is not trying to turn personal finances into a public feed. The trust bar is simple: be useful privately first, then let people choose what they want to keep, revisit, or share.",
    },
    trustCards: [
      {
        title: "No public-by-default money feed",
        body: "The product thesis is artifact-first, not feed-first. Curated outputs matter more than constant exposure.",
      },
      {
        title: "Previewable sharing",
        body: "Receipts, summaries, and place context should be reviewable before anything leaves the app.",
      },
      {
        title: "Launch honesty over growth theater",
        body: "The early-access flow is intentionally narrow because privacy, follow-up, and timing should stay explicit as intake opens.",
      },
    ] as const satisfies readonly CopyCard[],
    earlyAccess: {
      eyebrow: "Early access",
      title: "Get on the list.",
      body: "Tell us where Gama would help first. We will use your note to shape alpha access and product research.",
      notLiveTitle: "Live intake",
      notLiveBody:
        "This page accepts waitlist interest through the server-owned backend path, with explicit consent and clear follow-up expectations.",
      intakeFields: [
        {
          title: "Email",
          body: "Launch updates and invites.",
        },
        {
          title: "Money moment",
          body: "What you want help with first.",
        },
        {
          title: "Context",
          body: "Solo, shared, household, or advisor.",
        },
        {
          title: "Consent",
          body: "Only explicit waitlist follow-up.",
        },
      ] as const satisfies readonly CopyCard[],
      expectations: [
        "You will get a confirmation email.",
        "We may follow up for alpha access or product research.",
        "No referral games or aggressive lifecycle marketing.",
      ] as const satisfies readonly string[],
      primaryCta: { href: "#early-access", label: "Stay close to launch" },
      secondaryCta: { href: "#early-access", label: "Read the trust posture" },
    },
    closing: {
      eyebrow: "A serious pre-launch product",
      title: "Built to feel useful before it asks for attention.",
      body: "Gama is being shaped as a premium mobile product for daily clarity, event memory, place context, and shared-spend correctness. Early access will open when the product story and trust posture are ready to support it.",
    },
  },
  privacy: {
    hero: {
      eyebrow: "Privacy and trust",
      title: "Privacy-first resilience is part of the product thesis.",
      body: "Gama is designed to help people understand money with less admin work, not to turn financial behavior into a public performance layer.",
    },
    boundaries: {
      title: "What Gama does and does not imply",
      items: [
        "No public raw-spending feed is implied by the product or the website.",
        "No automatic public location sharing is part of the product story.",
        "No hidden growth-first posture should sit behind calm trust language.",
      ],
    } as const satisfies BulletListSection,
    minimization: {
      title: "Data minimization and launch discipline",
      items: [
        "Collect only what materially improves decision support, trust, or operations.",
        "Keep live waitlist capture limited to explicit early-access fields with clear operational ownership.",
        "Distinguish operational monitoring from product analytics rather than quietly blending them.",
      ],
    } as const satisfies BulletListSection,
    sharedContext: {
      title: "Shared visibility should never make personal autonomy ambiguous.",
      items: [
        "Shared spending and reimbursements should be understandable without exposing more than the user intends.",
        "Private autonomy remains explicit inside shared contexts and future artifact sharing.",
        "Any sharing should be opt-in, previewable, and grounded in user control.",
      ],
    } as const satisfies BulletListSection,
    currentState: [
      {
        eyebrow: "Current state",
        title: "The site is pre-launch with limited intake.",
        body: "The public web lane exists to explain the thesis, build trust, and capture early-access interest without implying general availability.",
      },
      {
        eyebrow: "Deferred by design",
        title: "Analytics and growth mechanics are not quietly active.",
        body: "The waitlist uses a server-owned submission path, while analytics-vendor integrations and referral mechanics remain deferred until the disclosure and operational story is ready.",
      },
    ] as const satisfies readonly CalloutCard[],
    primaryCta: { href: "/", label: "Return home" },
    secondaryCta: { href: "/", label: "Back to home" },
  },
  footer: {
    note: "Budget around life moments with forward-looking cash flow.",
    contactLabel: "Email Gama",
    contactHref: "mailto:gamabudget@gmail.com",
    utilityLinks: [{ href: "/", label: "Home" }] as const satisfies readonly FooterLink[],
    links: [{ href: "/", label: "Home" }] as const satisfies readonly NavLink[],
  },
} as const;
