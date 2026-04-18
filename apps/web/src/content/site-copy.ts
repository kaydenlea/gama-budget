type SiteRoute = "/" | "/waitlist" | "/privacy";

type NavLink = {
  href: SiteRoute;
  label: string;
};

type Highlight = {
  label: string;
  value: string;
};

type CopyCard = {
  title: string;
  body: string;
};

export const siteCopy: {
  navigation: NavLink[];
  hero: {
    eyebrow: string;
    kicker: string;
    title: string;
    body: string;
    highlights: Highlight[];
    primaryCta: NavLink;
    secondaryCta: NavLink;
  };
  differenceIntro: string;
  differencePillars: CopyCard[];
  scenarioIntro: string;
  scenarios: CopyCard[];
  trust: {
    title: string;
    body: string;
    points: string[];
  };
  waitlist: {
    title: string;
    body: string;
    previewTitle: string;
    previewBody: string;
    readinessNote: string;
    badges: Highlight[];
    intakeFields: { label: string; note: string }[];
    expectations: string[];
  };
  privacy: {
    title: string;
    body: string;
    badges: Highlight[];
    principles: string[];
    currentState: string[];
  };
  content: {
    title: string;
    body: string;
    tracks: CopyCard[];
  };
  foundation: {
    title: string;
    phases: CopyCard[];
  };
  footer: {
    note: string;
    links: NavLink[];
  };
} = {
  navigation: [
    { href: "/", label: "Home" },
    { href: "/waitlist", label: "Waitlist" },
    { href: "/privacy", label: "Privacy" }
  ],
  hero: {
    eyebrow: "Decision-first personal finance",
    kicker: "A calmer website foundation for the MVP path",
    title: "Clarity before cleanup.",
    body:
      "Gama is building a premium decision-first finance product centered on Safe-to-Spend, forward-looking cash flow, shared-spending correctness, and less admin work.",
    highlights: [
      { label: "Safe-to-Spend", value: "Daily guidance over guilt loops" },
      { label: "Shared autonomy", value: "Private and shared context kept explicit" },
      { label: "Forward-looking", value: "Cash flow that helps with the next move" }
    ],
    primaryCta: { href: "/waitlist", label: "See the waitlist plan" },
    secondaryCta: { href: "/privacy", label: "Review the privacy stance" }
  },
  differenceIntro:
    "The web lane should explain what makes Gama different without collapsing into generic budgeting language or pretending the app is already finished.",
  differencePillars: [
    {
      title: "Safe-to-Spend should answer the day, not punish the past.",
      body: "The product thesis is about a trusted next-step number and daily guidance, not retrospective category cleanup."
    },
    {
      title: "Shared spending and reimbursements are first-class product problems.",
      body: "The product should handle shared spending, reimbursements, and privacy boundaries explicitly instead of leaving them as spreadsheet residue."
    },
    {
      title: "Forward-looking cash flow matters more than a prettier ledger.",
      body: "Gama is meant to show what upcoming cash pressure means before the user learns about it too late."
    },
    {
      title: "Privacy-first trust belongs in the pitch, not only the security docs.",
      body: "The website should earn trust by being truthful, restrained, and clear about how growth surfaces will be added."
    }
  ],
  scenarioIntro:
    "The first website foundation should already reflect the product lanes it will eventually support: landing, waitlist, trust, and later educational SEO.",
  scenarios: [
    {
      title: "Shared households need clarity without surveillance.",
      body: "The website should speak to shared-spending correctness and private autonomy without turning into a generic family-budget pitch."
    },
    {
      title: "Freelancers and variable-income users need forward-looking framing.",
      body: "The web lane should signal that Gama is built for uncertainty, not only for stable paycheck budgeting."
    },
    {
      title: "Power users want less admin work, not another spreadsheet ritual.",
      body: "The website should make the decision layer legible without copying app UI patterns into the marketing lane."
    }
  ],
  trust: {
    title: "Trust, disclosure, and privacy have to be visible from the start.",
    body:
      "Even before the full website launches, the foundation should already make room for honest privacy copy, analytics guardrails, and product-truth disclosure.",
    points: [
      "No claims about unsupported features or availability windows.",
      "No hidden analytics-vendor assumptions wired into the scaffold.",
      "Clear separation between the marketing lane and the mobile product lane.",
      "Metadata, sitemap, and robots readiness built in now so later SEO work stays structured."
    ]
  },
  waitlist: {
    title: "Waitlist capture should optimize for signal quality, not vanity growth.",
    body:
      "The waitlist foundation should be ready for segmented demand capture once the MVP window is concrete, while staying honest that live intake is not wired yet in this repo pass.",
    previewTitle: "Structured intake beats a vague email box.",
    previewBody:
      "The eventual waitlist flow should capture enough context to help research, prioritization, and alpha access decisions instead of collecting anonymous vanity signups.",
    readinessNote:
      "The waitlist form shell is intentionally not live yet. Submission plumbing should only be added when privacy disclosures, follow-up rules, and MVP timing are ready.",
    badges: [
      { label: "Purpose", value: "Demand quality over vanity volume" },
      { label: "Follow-up", value: "Segmented research and alpha access" },
      { label: "Status", value: "Foundation ready, intake not live" }
    ],
    intakeFields: [
      { label: "Email", note: "Needed for eventual MVP notifications and research follow-up." },
      {
        label: "Primary pain point",
        note: "Used to learn whether Safe-to-Spend, reimbursements, or cash-flow pressure is the sharpest problem."
      },
      { label: "Context", note: "Solo, shared household, or freelancer helps segment demand honestly." },
      { label: "Research consent", note: "Optional follow-up stays explicit instead of being assumed." }
    ],
    expectations: [
      "Immediate confirmation should set expectations and avoid implying general availability.",
      "Follow-up should segment by pain point rather than sending generic blasts.",
      "Privacy language should explain what data is being stored and why before live capture ships.",
      "Referral mechanics remain out of scope until message quality and trust are strong."
    ]
  },
  privacy: {
    title: "Privacy and trust are part of the product thesis, not a footer afterthought.",
    body:
      "The web lane should make room for privacy-safe growth and clear disclosure without shipping speculative integrations or overstating how mature the public site already is.",
    badges: [
      { label: "Growth", value: "Privacy-safe by default" },
      { label: "Disclosure", value: "Truthful before optimized" },
      { label: "Data", value: "Only collect what is justified" }
    ],
    principles: [
      "Do not add analytics vendors before the disclosure and retention story is intentionally documented.",
      "Do not publish comparison or SEO pages that promise product behavior the mobile lane does not support yet.",
      "Do not treat the website as a substitute for the product roadmap or the product truth docs.",
      "Do not bury privacy expectations under conversion pressure."
    ],
    currentState: [
      "The website foundation is for landing, waitlist, trust, and later SEO surfaces only.",
      "The actual waitlist backend is intentionally not wired in this pass.",
      "Any future analytics integration should be added with explicit disclosure and runbook updates."
    ]
  },
  content: {
    title: "Future SEO content needs structure before it needs volume.",
    body:
      "The best time to define route, metadata, and content boundaries is before the website expands. That keeps later SEO and educational work grounded in product truth instead of retrofitting growth ideas into the app roadmap.",
    tracks: [
      {
        title: "Landing and trust",
        body: "A clear landing page, waitlist page, and privacy or trust surface should ship before deeper SEO work."
      },
      {
        title: "Educational guides",
        body: "Problem-framing and decision-first finance guides should come after the MVP messaging is stable."
      },
      {
        title: "Comparison surfaces",
        body: "Comparison or alternative pages belong later, once product truth and measurement are mature enough to support them."
      }
    ]
  },
  foundation: {
    title: "This web pass is about reducing future rework.",
    phases: [
      {
        title: "Foundation",
        body: "Current work: modern scaffold, route structure, metadata ownership, typed content, and design primitives."
      },
      {
        title: "MVP launch surfaces",
        body: "Next: live waitlist plumbing, stronger trust pages, and launch messaging once the mobile MVP timing is firm."
      },
      {
        title: "SEO and education",
        body: "Later: educational content and comparison surfaces only after they can stay faithful to the real product."
      }
    ]
  },
  footer: {
    note:
      "Mobile remains the primary product lane. The website exists to explain the thesis, earn trust, capture demand, and support later SEO without distorting app decisions.",
    links: [
      { href: "/", label: "Home" },
      { href: "/waitlist", label: "Waitlist" },
      { href: "/privacy", label: "Privacy" }
    ]
  }
};
