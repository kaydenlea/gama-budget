import { siteConfig } from "../lib/site-config";

const socialHighlights = [
  "Safe-to-Spend clarity",
  "Shared-spending correctness",
  "Forward-looking cash flow"
] as const;

export function SocialImageCard() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background:
          "linear-gradient(135deg, rgba(250,247,240,1) 0%, rgba(244,247,241,1) 55%, rgba(231,243,239,1) 100%)",
        color: "#112033",
        padding: "72px",
        fontFamily: "Segoe UI"
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          border: "1px solid rgba(188,199,192,0.8)",
          borderRadius: "40px",
          padding: "48px 56px",
          background: "rgba(255,255,255,0.86)",
          boxShadow: "0 24px 60px rgba(17,32,51,0.08)"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "22px", maxWidth: "760px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                borderRadius: "999px",
                border: "1px solid rgba(17,32,51,0.08)",
                background: "rgba(255,255,255,0.8)",
                color: "#0e766d",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                padding: "12px 20px",
                textTransform: "uppercase"
              }}
            >
              {siteConfig.name}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "72px", lineHeight: 1, fontWeight: 700 }}>Clarity before cleanup.</div>
              <div style={{ fontSize: "30px", lineHeight: 1.4, color: "#4f5f6d" }}>
                Decision-first personal finance for calmer daily guidance and less admin work.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            {socialHighlights.map((highlight) => (
              <div
                key={highlight}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "999px",
                  padding: "16px 22px",
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(188,199,192,0.8)",
                  color: "#112033",
                  fontSize: "24px",
                  fontWeight: 600
                }}
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
