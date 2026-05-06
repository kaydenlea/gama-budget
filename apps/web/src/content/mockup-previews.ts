export const mockupPreviews = {
  "overview-screen": {
    file: "overview-screen.html",
    mode: "viewport",
    background: "#f2f5f7",
    hideFixedNav: false
  },
  "cash-flow": {
    file: "cash-flow.html",
    mode: "page",
    background: "#f2f5f7",
    hideFixedNav: true
  },
  "event-details-share": {
    file: "event-details-share.html",
    mode: "page",
    background: "#d7e4ed",
    hideFixedNav: true
  },
  "event-details": {
    file: "event-details.html",
    mode: "page",
    background: "#d7e4ed",
    hideFixedNav: true
  },
  receipt: {
    file: "receipt.html",
    mode: "page",
    background: "#f7fafd",
    hideFixedNav: false
  },
  "review-transaction": {
    file: "review-transaction.html",
    mode: "page",
    background: "#f7fafd",
    hideFixedNav: false
  },
  "review-transaction-trust": {
    file: "review-transaction-trust.html",
    mode: "page",
    background: "#f5fafb",
    hideFixedNav: false
  },
  "add-transaction": {
    file: "add-transaction.html",
    mode: "page",
    background: "#f7fafd",
    hideFixedNav: false
  },
  "add-transaction-trust": {
    file: "add-transaction-trust.html",
    mode: "page",
    background: "#f5fafb",
    hideFixedNav: false
  },
  stories: {
    file: "stories.html",
    mode: "page",
    background: "#000000",
    hideFixedNav: false
  },
  "transactions-chronological": {
    file: "transactions-chronological.html",
    mode: "page",
    background: "#f1f5f9",
    hideFixedNav: false
  },
  "transactions-categorized": {
    file: "transactions-categorized.html",
    mode: "page",
    background: "#f1f5f9",
    hideFixedNav: false
  },
  "marker-popup": {
    file: "marker-popup.html",
    mode: "page",
    background: "#f1f5f9",
    hideFixedNav: false
  },
  accounts: {
    file: "accounts.html",
    mode: "page",
    background: "#0b141a",
    hideFixedNav: true
  },
  "accounts-trust": {
    file: "accounts.html",
    mode: "page",
    background: "#0b141a",
    hideFixedNav: true
  },
  bills: {
    file: "bills.html",
    mode: "page",
    background: "#f2f5f7",
    hideFixedNav: true
  }
} as const;

export type MockupPreviewSlug = keyof typeof mockupPreviews;
