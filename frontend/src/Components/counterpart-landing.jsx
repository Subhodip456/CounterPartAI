import { useState } from "react";
import NavSection from "./layout/Nav";
import FooterSection from "./layout/Footer";
import HeroSection from "./sections/Hero";
import ReviewComparisonSection from "./sections/ReviewComparison";
import StepsSectionComponent from "./sections/StepsSection";
import PricingSectionComponent from "./sections/PricingSection";
import TrialFormSection from "./sections/TrialForm";
import FAQSectionComponent from "./sections/FAQSection";

/* ---------- Design tokens ---------- */
const tokens = {
  ink: "#14201A",
  awning: "#1B3A2B",
  awningLight: "#23503A",
  butter: "#F0C14B",
  butterDeep: "#C99A2E",
  paper: "#FAF6EE",
  paperDim: "#F1EADA",
  brick: "#B0503B",
  text: "#20241D",
  muted: "#5C6459",
  line: "#D8D0BC",
};

const styles = `
  .cp-root {
    font-family: 'IBM Plex Sans', sans-serif;
    background: ${tokens.paper};
    color: ${tokens.text};
    line-height: 1.5;
  }
  .cp-root h1, .cp-root h2, .cp-root h3 {
    font-family: 'Fraunces', serif;
    font-weight: 600;
    margin: 0;
    color: ${tokens.ink};
  }
  .cp-root p { margin: 0; }
  .cp-root a { color: inherit; text-decoration: none; }
  .cp-wrap { max-width: 1080px; margin: 0 auto; padding: 0 32px; }

  .cp-nav { background: rgba(250, 246, 238, 0.92); backdrop-filter: blur(6px); border-bottom: 1px solid ${tokens.line}; position: sticky; top: 0; z-index: 50; transition: background-color 0.22s ease, border-color 0.22s ease, padding 0.22s ease; }
  .cp-nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 18px 32px; max-width: 1080px; margin: 0 auto; transition: max-width 0.22s ease, padding 0.22s ease, border-radius 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease; }
  .cp-nav-scrolled { background: transparent; border-bottom-color: transparent; padding: 14px 24px 0; backdrop-filter: none; }
  .cp-nav-scrolled .cp-nav-inner { max-width: 900px; padding: 12px 24px; border-radius: 999px; background: rgba(241, 234, 218, 0.48); backdrop-filter: blur(12px); box-shadow: 0 10px 26px -18px rgba(20,32,26,0.32); border: 1px solid rgba(250,246,238,0.58); }
  .cp-brand { display: flex; align-items: center; gap: 10px; font-family: 'Fraunces', serif; font-weight: 700; font-size: 1.3rem; color: ${tokens.ink}; }
  .cp-brand-mark { width: 30px; height: 30px; background: ${tokens.awning}; border-radius: 7px; position: relative; flex-shrink: 0; box-shadow: 0 2px 6px rgba(20,32,26,0.25); }
  .cp-brand-mark::after { content: ''; position: absolute; top: 8px; left: 6px; right: 6px; height: 2px; border-radius: 1px; background: ${tokens.butter}; box-shadow: 0 6px 0 ${tokens.butter}, 0 12px 0 ${tokens.butter}; }
  .cp-nav-links { display: flex; gap: 32px; font-size: 0.95rem; color: ${tokens.muted}; }
  .cp-nav-links a { position: relative; padding-bottom: 3px; transition: color 0.15s ease; }
  .cp-nav-links a:hover { color: ${tokens.ink}; }
  .cp-nav-links a::after { content: ''; position: absolute; left: 0; right: 100%; bottom: 0; height: 1.5px; background: ${tokens.awning}; transition: right 0.2s ease; }
  .cp-nav-links a:hover::after { right: 0; }
  @media (max-width: 720px) { .cp-nav-links { display: none; } .cp-nav-scrolled { padding: 10px 16px 0; } .cp-nav-scrolled .cp-nav-inner { padding: 10px 16px; } }

  .cp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 24px; border-radius: 6px; font-weight: 600; font-size: 0.95rem; cursor: pointer; font-family: inherit; transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.15s ease; }
  .cp-btn:active { transform: translateY(1px); }

  .cp-hero { padding: 96px 0 84px; border-bottom: 1px solid ${tokens.line}; position: relative; overflow: hidden; }
  .cp-hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }
  @media (max-width: 860px) { .cp-hero-grid { grid-template-columns: 1fr; } }
  .cp-hero-tag { font-size: 0.9rem; color: ${tokens.awning}; font-weight: 600; margin-bottom: 18px; }
  .cp-hero h1 { font-size: 3.2rem; line-height: 1.08; letter-spacing: -0.01em; }
  .cp-hero-sub { margin-top: 22px; font-size: 1.12rem; color: ${tokens.muted}; max-width: 520px; }
  .cp-hero-actions { margin-top: 32px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .cp-hero-proof { margin-top: 30px; display: flex; gap: 26px; font-size: 0.86rem; color: ${tokens.muted}; flex-wrap: wrap; }
  .cp-hero-proof span { display: flex; align-items: center; gap: 7px; }
  .cp-dot { width: 6px; height: 6px; border-radius: 50%; background: ${tokens.awning}; flex-shrink: 0; }
  @media (max-width: 640px) { .cp-hero h1 { font-size: 2.2rem; } }

  .cp-hero-visual { background: ${tokens.ink}; border-radius: 12px; padding: 28px; box-shadow: 0 20px 40px -16px rgba(20,32,26,0.4); position: relative; }
  .cp-hero-visual::before { content: ''; position: absolute; top: -10px; right: -10px; width: 64px; height: 64px; background: ${tokens.butter}; border-radius: 50%; opacity: 0.15; }
  .cp-hero-visual-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .cp-hero-visual-label { font-size: 0.78rem; color: #9AAC9C; font-family: 'IBM Plex Mono', monospace; }
  .cp-hero-visual-badge { font-size: 0.72rem; font-weight: 600; color: ${tokens.awning}; background: ${tokens.butter}; padding: 3px 9px; border-radius: 20px; }
  .cp-hero-visual-quote { color: ${tokens.paper}; font-size: 1rem; line-height: 1.55; font-family: 'IBM Plex Mono', monospace; }
  .cp-hero-visual-reply { margin-top: 18px; padding-top: 16px; border-top: 1px dashed #2C3B2E; color: #B9C2B4; font-size: 0.9rem; line-height: 1.6; }
  .cp-hero-visual-reply b { color: ${tokens.butter}; display: block; font-size: 0.78rem; margin-bottom: 6px; font-weight: 600; }

  .cp-section { padding: 88px 0; }
  .cp-section-head { max-width: 620px; margin-bottom: 48px; }
  .cp-section-head h2 { font-size: 2rem; }
  .cp-section-head p { margin-top: 14px; color: ${tokens.muted}; font-size: 1.05rem; }

  .cp-tickets { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  @media (max-width: 760px) { .cp-tickets { grid-template-columns: 1fr; } }
  .cp-ticket { background: ${tokens.paper}; border: 1.5px solid ${tokens.ink}; border-radius: 4px; padding: 26px 26px 30px; position: relative; font-family: 'IBM Plex Mono', monospace; box-shadow: 0 8px 20px -12px rgba(20,32,26,0.25); }
  .cp-ticket::before, .cp-ticket::after { content: ''; position: absolute; left: 0; right: 0; height: 12px; background: repeating-linear-gradient(90deg, transparent 0 8px, ${tokens.line} 8px 9px); }
  .cp-ticket::before { top: -6px; }
  .cp-ticket::after { bottom: -6px; }
  .cp-ticket-status { display: inline-block; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 4px 10px; border-radius: 3px; margin-bottom: 16px; }
  .cp-status-bad { background: #F3DFD8; color: ${tokens.brick}; }
  .cp-status-good { background: #DCE9DD; color: ${tokens.awning}; }
  .cp-ticket-stars { color: ${tokens.butterDeep}; letter-spacing: 2px; margin-bottom: 10px; }
  .cp-ticket-quote { font-size: 0.98rem; line-height: 1.6; }
  .cp-ticket-attr { margin-top: 10px; font-size: 0.82rem; color: ${tokens.muted}; }
  .cp-ticket-reply { margin-top: 20px; padding-top: 18px; border-top: 1px dashed ${tokens.line}; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.92rem; line-height: 1.6; }
  .cp-ticket-reply-label { font-weight: 600; color: ${tokens.awning}; font-size: 0.8rem; margin-bottom: 8px; }
  .cp-ticket-empty { margin-top: 20px; padding-top: 18px; border-top: 1px dashed ${tokens.line}; font-family: 'IBM Plex Sans', sans-serif; font-size: 0.9rem; color: ${tokens.brick}; }

  .cp-steps-section { background: ${tokens.ink}; color: ${tokens.paper}; padding: 88px 0; }
  .cp-steps-section .cp-section-head h2 { color: ${tokens.paper}; }
  .cp-steps-section .cp-section-head p { color: #B9C2B4; }
  .cp-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  @media (max-width: 760px) { .cp-steps { grid-template-columns: 1fr; } }
  .cp-step { padding: 30px 26px; background: #1C2B1E; border: 1px solid #2C3B2E; border-radius: 8px; transition: transform 0.15s ease, border-color 0.15s ease; }
  .cp-step-num { font-family: 'Fraunces', serif; font-size: 2.2rem; color: ${tokens.butter}; line-height: 1; margin-bottom: 16px; }
  .cp-step h3 { color: ${tokens.paper}; font-size: 1.12rem; margin-bottom: 10px; }
  .cp-step p { color: #B9C2B4; font-size: 0.94rem; }

  .cp-plans { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: stretch; }
  @media (max-width: 760px) { .cp-plans { grid-template-columns: 1fr; } }
  .cp-plan { padding: 36px 32px; border: 1.5px solid ${tokens.line}; border-radius: 10px; display: flex; flex-direction: column; background: ${tokens.paper}; }
  .cp-plan-featured { border-color: ${tokens.ink}; background: ${tokens.ink}; color: ${tokens.paper}; box-shadow: 0 24px 48px -20px rgba(20,32,26,0.45); }
  .cp-plan-featured .cp-plan-desc { color: #B9C2B4; }
  .cp-plan-name { font-family: 'Fraunces', serif; font-size: 1.4rem; margin-bottom: 8px; }
  .cp-plan-desc { color: ${tokens.muted}; font-size: 0.92rem; margin-bottom: 24px; }
  .cp-plan-price { font-family: 'Fraunces', serif; font-size: 2.6rem; margin-bottom: 4px; }
  .cp-plan-price span { font-family: 'IBM Plex Sans', sans-serif; font-size: 1rem; font-weight: 400; opacity: 0.7; }
  .cp-plan-features { list-style: none; padding: 0; margin: 28px 0 32px; font-size: 0.92rem; }
  .cp-plan-features li { padding: 9px 0; border-top: 1px solid rgba(0,0,0,0.08); display: flex; gap: 10px; }
  .cp-plan-featured .cp-plan-features li { border-top: 1px solid rgba(255,255,255,0.12); }
  .cp-plan-features li:first-child { border-top: none; }
  .cp-check { color: ${tokens.awning}; font-weight: 700; flex-shrink: 0; }
  .cp-plan-featured .cp-check { color: ${tokens.butter}; }
  .cp-plan .cp-btn { margin-top: auto; }
  .cp-plan-tag { display: inline-block; font-size: 0.75rem; font-weight: 700; color: ${tokens.ink}; background: ${tokens.butter}; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; width: fit-content; }

  .cp-form-card { background: ${tokens.paperDim}; border: 1.5px solid ${tokens.line}; border-radius: 12px; padding: 48px; max-width: 640px; margin: 0 auto; box-shadow: 0 12px 32px -20px rgba(20,32,26,0.3); }
  .cp-form-card h2 { font-size: 1.8rem; text-align: center; }
  .cp-form-card > p { text-align: center; color: ${tokens.muted}; margin-top: 12px; font-size: 1rem; }
  .cp-form-grid { margin-top: 32px; display: flex; flex-direction: column; gap: 18px; }
  .cp-label { font-size: 0.88rem; font-weight: 500; color: ${tokens.ink}; margin-bottom: 6px; display: block; }
  .cp-input { width: 100%; padding: 12px 14px; border: 1.5px solid ${tokens.line}; border-radius: 6px; font-family: inherit; font-size: 0.95rem; background: ${tokens.paper}; color: ${tokens.text}; transition: border-color 0.15s ease; }
  .cp-input:focus { outline: none; border-color: ${tokens.awning}; box-shadow: 0 0 0 3px rgba(27,58,43,0.12); }
  .cp-form-submit { margin-top: 8px; width: 100%; padding: 15px; font-size: 1rem; }
  .cp-form-note { text-align: center; margin-top: 16px; font-size: 0.85rem; color: ${tokens.muted}; }
  .cp-form-success { text-align: center; padding: 22px; background: #DCE9DD; color: ${tokens.awning}; border-radius: 8px; font-weight: 600; }

  .cp-faq-list { display: flex; flex-direction: column; gap: 12px; }
  .cp-faq-item { border: 1px solid ${tokens.line}; border-radius: 8px; padding: 20px 24px; background: ${tokens.paper}; transition: border-color 0.15s ease; }
  .cp-faq-question { cursor: pointer; font-weight: 600; font-size: 1.02rem; color: ${tokens.ink}; display: flex; justify-content: space-between; align-items: center; background: none; border: none; width: 100%; text-align: left; padding: 0; font-family: inherit; }
  .cp-faq-icon { font-family: 'Fraunces', serif; font-size: 1.4rem; color: ${tokens.awning}; flex-shrink: 0; margin-left: 16px; }
  .cp-faq-answer { margin-top: 14px; color: ${tokens.muted}; font-size: 0.95rem; line-height: 1.6; }

  .cp-footer { border-top: 1px solid ${tokens.line}; padding: 36px 0; }
  .cp-footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 0.88rem; color: ${tokens.muted}; }
`;

/* ---------- Button: colors set inline so contrast can never be lost to outside styles ---------- */

const buttonVariants = {
  primary: {
    background: tokens.awning,
    color: tokens.paper,
    border: "none",
    hoverBackground: tokens.awningLight,
    boxShadow: "0 6px 16px -6px rgba(27,58,43,0.5)",
  },
  outline: {
    background: "transparent",
    color: tokens.ink,
    border: `1.5px solid ${tokens.ink}`,
    hoverBackground: "rgba(20,32,26,0.06)",
  },
  outlineInverse: {
    background: "transparent",
    color: tokens.paper,
    border: `1.5px solid ${tokens.paper}`,
    hoverBackground: "rgba(250,246,238,0.12)",
  },
};

export function Button({ variant = "primary", href, onClick, children, style = {} }) {
  const v = buttonVariants[variant] || buttonVariants.primary;
  const [hover, setHover] = useState(false);
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      className="cp-btn"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? v.hoverBackground : v.background,
        color: v.color,
        border: v.border,
        boxShadow: hover ? v.boxShadow : "none",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Reusable components ---------- */

export function FontLoader() {
  return (
    <>
      <style>{styles}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

export function Nav({ brand = "Counterpart", links = [], ctaLabel = "Start free trial", ctaHref = "#trial" }) {
  return (
    <nav className="cp-nav">
      <div className="cp-nav-inner">
        <div className="cp-brand">
          <span className="cp-brand-mark"></span>
          {brand}
        </div>
        <div className="cp-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>
        <Button variant="primary" href={ctaHref} style={{ padding: "10px 20px", fontSize: "0.9rem" }}>
          {ctaLabel}
        </Button>
      </div>
    </nav>
  );
}

export function Hero({ tag, title, subtitle, primaryCta, secondaryCta, proofPoints = [] }) {
  return (
    <header className="cp-hero">
      <div className="cp-wrap cp-hero-grid">
        <div>
          {tag && <p className="cp-hero-tag">{tag}</p>}
          <h1>{title}</h1>
          <p className="cp-hero-sub">{subtitle}</p>
          <div className="cp-hero-actions">
            {primaryCta && <Button variant="primary" href={primaryCta.href}>{primaryCta.label}</Button>}
            {secondaryCta && <Button variant="outline" href={secondaryCta.href}>{secondaryCta.label}</Button>}
          </div>
          {proofPoints.length > 0 && (
            <div className="cp-hero-proof">
              {proofPoints.map((p, i) => (
                <span key={i}><span className="cp-dot"></span>{p}</span>
              ))}
            </div>
          )}
        </div>
        <div className="cp-hero-visual">
          <div className="cp-hero-visual-row">
            <span className="cp-hero-visual-label">google_review.log</span>
            <span className="cp-hero-visual-badge">Replied · 3h</span>
          </div>
          <p className="cp-hero-visual-quote">"Food arrived 40 minutes late and was lukewarm. Ruined our anniversary dinner."</p>
          <div className="cp-hero-visual-reply">
            <b>Reply, approved by the owner</b>
            "Priya, I'm sorry — that's not the night we wanted for you. We've fixed our weekend dispatch times. Email me and dinner's on us next visit."
          </div>
        </div>
      </div>
    </header>
  );
}

export function SectionHead({ title, description }) {
  return (
    <div className="cp-section-head">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function ReviewTicket({ status, statusType = "good", stars = 5, quote, attribution, reply, emptyMessage }) {
  return (
    <div className="cp-ticket">
      <span className={`cp-ticket-status ${statusType === "good" ? "cp-status-good" : "cp-status-bad"}`}>
        {status}
      </span>
      <div className="cp-ticket-stars">{"★".repeat(stars)}</div>
      <p className="cp-ticket-quote">"{quote}"</p>
      <p className="cp-ticket-attr">{attribution}</p>
      {reply && (
        <div className="cp-ticket-reply">
          <div className="cp-ticket-reply-label">Reply, approved by the owner</div>
          {reply}
        </div>
      )}
      {emptyMessage && <div className="cp-ticket-empty">{emptyMessage}</div>}
    </div>
  );
}

export function ReviewComparison({ title, description, badReview, goodReview }) {
  return (
    <section className="cp-section" id="compare">
      <div className="cp-wrap">
        <SectionHead title={title} description={description} />
        <div className="cp-tickets">
          <ReviewTicket statusType="bad" {...badReview} />
          <ReviewTicket statusType="good" {...goodReview} />
        </div>
      </div>
    </section>
  );
}

export function StepCard({ number, title, description }) {
  return (
    <div className="cp-step">
      <div className="cp-step-num">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function StepsSection({ title, description, steps = [] }) {
  return (
    <section className="cp-steps-section" id="how">
      <div className="cp-wrap">
        <SectionHead title={title} description={description} />
        <div className="cp-steps">
          {steps.map((s, i) => (
            <StepCard key={i} number={i + 1} title={s.title} description={s.description} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingPlan({ name, description, price, period = "/month", features = [], featured = false, ctaLabel = "Start free trial", ctaHref = "#trial", tag }) {
  return (
    <div className={`cp-plan ${featured ? "cp-plan-featured" : ""}`}>
      {tag && <span className="cp-plan-tag">{tag}</span>}
      <div className="cp-plan-name">{name}</div>
      <p className="cp-plan-desc">{description}</p>
      <div className="cp-plan-price">{price}<span>{period}</span></div>
      <ul className="cp-plan-features">
        {features.map((f, i) => (
          <li key={i}><span className="cp-check">✓</span>{f}</li>
        ))}
      </ul>
      <Button variant={featured ? "outlineInverse" : "outline"} href={ctaHref}>{ctaLabel}</Button>
    </div>
  );
}

export function PricingSection({ title, description, plans = [] }) {
  return (
    <section className="cp-section" id="pricing">
      <div className="cp-wrap">
        <SectionHead title={title} description={description} />
        <div className="cp-plans">
          {plans.map((p, i) => (
            <PricingPlan key={i} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrialForm({ title, description, fields = [], submitLabel = "Start my free trial", note, onSubmit }) {
  const initialState = Object.fromEntries(fields.map((f) => [f.id, ""]));
  const [values, setValues] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(values);
    setSubmitted(true);
  };

  return (
    <section className="cp-section" id="trial">
      <div className="cp-wrap">
        <div className="cp-form-card">
          <h2>{title}</h2>
          <p>{description}</p>
          {submitted ? (
            <div className="cp-form-success" style={{ marginTop: "32px" }}>
              Got it — you'll hear from us within a day.
            </div>
          ) : (
            <div className="cp-form-grid">
              {fields.map((f) => (
                <div key={f.id}>
                  <label className="cp-label" htmlFor={f.id}>{f.label}</label>
                  <input
                    className="cp-input"
                    id={f.id}
                    type="text"
                    placeholder={f.placeholder}
                    value={values[f.id]}
                    onChange={(e) => handleChange(f.id, e.target.value)}
                  />
                </div>
              ))}
              <Button variant="primary" onClick={handleSubmit} style={{ width: "100%", marginTop: "8px", padding: "15px", fontSize: "1rem" }}>
                {submitLabel}
              </Button>
            </div>
          )}
          {note && <p className="cp-form-note">{note}</p>}
        </div>
      </div>
    </section>
  );
}

export function FAQItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cp-faq-item" style={{ borderColor: open ? tokens.awning : tokens.line }}>
      <button className="cp-faq-question" onClick={() => setOpen(!open)}>
        {question}
        <span className="cp-faq-icon">{open ? "–" : "+"}</span>
      </button>
      {open && <p className="cp-faq-answer">{answer}</p>}
    </div>
  );
}

export function FAQSection({ title, items = [] }) {
  return (
    <section className="cp-section" id="faq">
      <div className="cp-wrap">
        <SectionHead title={title} />
        <div className="cp-faq-list">
          {items.map((item, i) => (
            <FAQItem key={i} {...item} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer({ text, copyright }) {
  return (
    <footer className="cp-footer">
      <div className="cp-wrap cp-footer-inner">
        <div>{text}</div>
        <div>{copyright}</div>
      </div>
    </footer>
  );
}

/* ---------- Assembled page ---------- */

export default function CounterpartLanding() {
  return (
    <div className="cp-root">
      <FontLoader />
      <NavSection
        brand="Counterpart"
        links={[
          { href: "#how", label: "How it works" },
          { href: "#compare", label: "Live example" },
          { href: "#pricing", label: "Pricing" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <HeroSection
        tag="For restaurants, clinics, salons and trades"
        title="A one-star review sits there until someone answers it."
        subtitle="Counterpart watches your Google profile, writes a reply in your voice within a day, and sends it to you for a one-tap approval. Nothing goes live without your say."
        primaryCta={{ label: "Start your 7-day trial", href: "#trial" }}
        secondaryCta={{ label: "See a real example", href: "#compare" }}
        proofPoints={["No card to start", "Cancel in one message", "You approve every word"]}
      />
      <ReviewComparisonSection
        title="People read your replies before they book."
        description="A bad review isn't the problem. Silence is. Here's the same complaint, handled two different ways."
        badReview={{
          status: "No reply · 4 months",
          stars: 5,
          quote: "Food arrived 40 minutes late and was lukewarm. Ruined our anniversary dinner.",
          attribution: "— posted on Google, via a diner named Priya",
          emptyMessage: "Anyone reading this now assumes you never fixed it.",
        }}
        goodReview={{
          status: "Replied · 3 hours",
          stars: 5,
          quote: "Food arrived 40 minutes late and was lukewarm. Ruined our anniversary dinner.",
          attribution: "— posted on Google, via a diner named Priya",
          reply: "Priya, I'm sorry — that's not the night we wanted for your anniversary. We've moved dispatch times up for weekend rushes. Email me directly and dinner's on us next time.",
        }}
      />
      <StepsSectionComponent
        title="Fifteen minutes a month, start to finish."
        description="You don't log into anything new. It comes to you."
        steps={[
          { title: "We watch your listing", description: "Every new review, good or bad, is caught the moment it posts — no dashboard for you to check." },
          { title: "We write the reply", description: "Matched to how you actually talk, not a template. It reaches you on WhatsApp or email for approval." },
          { title: "You tap once", description: "Approve, edit a line, or skip it. Nothing posts without you. Fridays, you get a three-line recap." },
        ]}
      />
      <PricingSectionComponent
        title="Priced under what one lost customer costs you."
        description="Both plans start with seven days handled for free."
        plans={[
          {
            name: "Corner Shop",
            description: "For a single location with steady, not constant, review volume.",
            price: "$99",
            features: ["Up to 20 replies a month", "Reply within 48 hours", "Approvals by email", "Basic tone-matching to your brand"],
          },
          {
            name: "Full Storefront",
            description: "For businesses that can't afford a review to sit unanswered.",
            price: "$199",
            featured: true,
            tag: "Most chosen",
            features: [
              "Unlimited replies",
              "Reply within 24 hours",
              "Approvals by WhatsApp or email, one tap",
              "Weekly three-line results note",
              "Local keywords worked into replies",
            ],
          },
        ]}
      />
      <TrialFormSection
        title="Start your seven days, free."
        description="Send us your listing. Within a day, we'll have real replies drafted for your most recent unanswered reviews — free to look at either way."
        fields={[
          { id: "biz", label: "Business name", placeholder: "e.g. Bella Italia Bistro" },
          { id: "name", label: "Your name", placeholder: "e.g. Marco Rossi" },
          { id: "contact", label: "Email or WhatsApp number", placeholder: "owner@business.com or phone" },
          { id: "listing", label: "Google Maps or website link", placeholder: "Paste your listing link" },
        ]}
        submitLabel="Start my free 7 days — no card needed"
        note="Zero commitment. If the replies aren't right for your voice, walk away — no questions."
      />
      <FAQSectionComponent
        title="Questions owners usually ask"
        items={[
          { question: "Do you post anything without my permission?", answer: "Never. Every reply reaches you first, by WhatsApp or email. Approve as written, change a line, or skip it — you're always the last word." },
          { question: "What happens during the free seven days?", answer: "We handle every review that comes in during that week, same as a paying week. If it's clearly saving you time, we send a simple link to continue at $99 or $199. If not, you owe nothing." },
          { question: "Does this work for platforms besides Google?", answer: "Yes — Yelp, Facebook Pages, and TripAdvisor are covered on the Full Storefront plan." },
          { question: "What if a review is abusive or clearly fake?", answer: "We flag it separately rather than drafting a normal reply, and let you know how to report it on the platform directly." },
        ]}
      />
      <FooterSection
        text="Counterpart — the reply desk for businesses too busy to check reviews daily."
        copyright="© 2026 Counterpart"
      />
    </div>
  );
}
