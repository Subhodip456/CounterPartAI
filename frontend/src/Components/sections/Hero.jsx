import { Button } from "../counterpart-landing";

export default function Hero({ tag, title, subtitle, primaryCta, secondaryCta, proofPoints = [] }) {
  return <header className="cp-hero"><div className="cp-wrap cp-hero-grid"><div>
    {tag && <p className="cp-hero-tag">{tag}</p>}<h1>{title}</h1><p className="cp-hero-sub">{subtitle}</p>
    <div className="cp-hero-actions">{primaryCta && <Button variant="primary" href={primaryCta.href}>{primaryCta.label}</Button>}{secondaryCta && <Button variant="outline" href={secondaryCta.href}>{secondaryCta.label}</Button>}</div>
    {proofPoints.length > 0 && <div className="cp-hero-proof">{proofPoints.map((point) => <span key={point}><span className="cp-dot" />{point}</span>)}</div>}
  </div><div className="cp-hero-visual"><div className="cp-hero-visual-row"><span className="cp-hero-visual-label">google_review.log</span><span className="cp-hero-visual-badge">Replied · 3h</span></div><p className="cp-hero-visual-quote">"Food arrived 40 minutes late and was lukewarm. Ruined our anniversary dinner."</p><div className="cp-hero-visual-reply"><b>Reply, approved by the owner</b>"Hailey, I'm sorry — that's not the night we wanted for you. We've fixed our weekend dispatch times. Email me and dinner's on us next visit."</div></div>
  </div></header>;
}
