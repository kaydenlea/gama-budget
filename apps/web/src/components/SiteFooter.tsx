import Image from "next/image";
import { SiteContainer } from "@gama/ui-web";
import gamaLogo from "../../app/icon.png";
import { siteCopy } from "../content/site-copy";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M14.3 4V14.4A4.3 4.3 0 1 1 10 10.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M14.3 4C14.8 5.9 16.3 7.4 18.4 7.9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L2.25 2.25h6.937l4.265 5.638L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3.75" y="5.5" width="16.5" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.6 8.1 12 12.7l6.4-4.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer-shell py-8 md:py-10">
      <SiteContainer className="site-footer-grid">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <div className="site-footer-brand-row">
              <Image
                alt="Gama logo"
                className="site-footer-brand-mark"
                height={52}
                src={gamaLogo}
                width={52}
              />
              <div className="site-footer-brand-copy">
                <p className="site-footer-brand-name">Gama</p>
                <p className="site-footer-brand-note">{siteCopy.footer.note}</p>
              </div>
            </div>
          </div>

          <div className="site-footer-meta">
            <div className="site-footer-meta-group">
              <span className="site-footer-label">Social</span>
              <div className="site-footer-social-placeholder" aria-label="Social links coming soon">
                <span className="site-footer-social-icon site-footer-social-icon-instagram" aria-label="Instagram coming soon" role="img">
                  <InstagramIcon />
                </span>
                <span className="site-footer-social-icon site-footer-social-icon-tiktok" aria-label="TikTok coming soon" role="img">
                  <TikTokIcon />
                </span>
                <span className="site-footer-social-icon site-footer-social-icon-x" aria-label="X coming soon" role="img">
                  <XIcon />
                </span>
                <a className="site-footer-social-icon site-footer-contact-link" href={siteCopy.footer.contactHref} aria-label={siteCopy.footer.contactLabel}>
                  <EmailIcon />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>© {currentYear} Gama</p>
        </div>
      </SiteContainer>
    </footer>
  );
}
