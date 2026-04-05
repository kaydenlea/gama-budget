import { siteCopy } from "./site-copy";

describe("siteCopy", () => {
  it("keeps the landing lane aligned with the product thesis", () => {
    expect(siteCopy.hero.body).toContain("Safe-to-Spend");
    expect(siteCopy.differencePillars.map((pillar) => pillar.body).join(" ")).toContain("shared spending");
    expect(siteCopy.waitlist.readinessNote).toContain("not live");
    expect(siteCopy.privacy.principles.join(" ")).toContain("privacy");
  });
});
