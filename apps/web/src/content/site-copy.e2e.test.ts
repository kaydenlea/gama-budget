import { siteCopy } from "./site-copy";

describe("siteCopy", () => {
  it("keeps the core site aligned with the product thesis", () => {
    expect(siteCopy.home.hero.body).toContain("Safe-to-Spend");
    expect(siteCopy.home.connectMarquee.institutions).toHaveLength(8);
    expect(siteCopy.home.signatureFeatures.cards).toHaveLength(4);
    expect(siteCopy.home.signatureFeatures.cards.map((card) => card.previewSlug)).toContain("marker-popup");
    expect(siteCopy.home.signatureFeatures.cards.map((card) => card.previewSlug)).toContain("event-details");
    expect(siteCopy.home.walkthrough.steps).toHaveLength(4);
    expect(siteCopy.home.walkthrough.steps.map((step) => step.previewSlug)).toContain("cash-flow");
    expect(siteCopy.home.trustBridge.slides).toHaveLength(4);
    expect(siteCopy.home.trustBridge.slides.map((slide) => slide.previewSlug)).toContain("accounts-trust");
    expect(siteCopy.home.trustBridge.slides.map((slide) => slide.previewSlug)).toContain("add-transaction-trust");
    expect(siteCopy.home.screenGallery.cards.map((card) => card.previewSlug)).toContain("stories");
    expect(siteCopy.waitlist.hero.body).toContain("short-term money clarity");
    expect(siteCopy.shared.storyScenes.map((scene) => scene.body).join(" ")).toContain("shared-spend");
    expect(siteCopy.waitlist.earlyAccess.notLiveBody).toContain("server-owned backend");
    expect(siteCopy.privacy.hero.title).toContain("Privacy-first");
  });
});
