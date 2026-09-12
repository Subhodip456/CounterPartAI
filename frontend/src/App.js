import { FontLoader } from "./Components/counterpart-landing";
import Nav from "./Components/layout/Nav";
import Footer from "./Components/layout/Footer";
import Hero from "./Components/sections/Hero";
import ReviewComparison from "./Components/sections/ReviewComparison";
import StepsSection from "./Components/sections/StepsSection";
import PricingSection from "./Components/sections/PricingSection";
import TrialForm from "./Components/sections/TrialForm";
import FAQSection from "./Components/sections/FAQSection";

function App() {
  return (
    <div className="App cp-root">
      <FontLoader />
      <Nav brand="Counterpart" links={[{ href: "#how", label: "How it works" }, { href: "#compare", label: "Live example" }, { href: "#pricing", label: "Pricing" }, { href: "#faq", label: "FAQ" }]} />
      <Hero tag="For restaurants, clinics, salons and trades" title="A one-star review sits there until someone answers it." subtitle="Counterpart watches your Google profile, writes a reply in your voice within a day, and sends it to you for a one-tap approval. Nothing goes live without your say." primaryCta={{ label: "Start your 7-day trial", href: "#trial" }} secondaryCta={{ label: "See a real example", href: "#compare" }} proofPoints={["No card to start", "Cancel in one message", "You approve every word"]} />
      <ReviewComparison title="People read your replies before they book." description="A bad review isn't the problem. Silence is. Here's the same complaint, handled two different ways." badReview={{ status: "No reply · 4 months", stars: 5, quote: "Food arrived 40 minutes late and was lukewarm. Ruined our anniversary dinner.", attribution: "— posted on Google, via a diner named Hailey", emptyMessage: "Anyone reading this now assumes you never fixed it." }} goodReview={{ status: "Replied · 3 hours", stars: 5, quote: "Food arrived 40 minutes late and was lukewarm. Ruined our anniversary dinner.", attribution: "— posted on Google, via a diner named Hailey", reply: "Hailey, I'm sorry — that's not the night we wanted for your anniversary. We've moved dispatch times up for weekend rushes. Email me directly and dinner's on us next time." }} />
      <StepsSection title="Fifteen minutes a month, start to finish." description="You don't log into anything new. It comes to you." steps={[{ title: "We watch your listing", description: "Every new review, good or bad, is caught the moment it posts — no dashboard for you to check." }, { title: "We write the reply", description: "Matched to how you actually talk, not a template. It reaches you on WhatsApp or email for approval." }, { title: "You tap once", description: "Approve, edit a line, or skip it. Nothing posts without you. Fridays, you get a three-line recap." }]} />
      <PricingSection title="Priced under what one lost customer costs you." description="Both plans start with seven days handled for free." plans={[{ name: "Corner Shop", description: "For a single location with steady, not constant, review volume.", price: "$99", features: ["Up to 20 replies a month", "Reply within 48 hours", "Approvals by email", "Basic tone-matching to your brand"] }, { name: "Full Storefront", description: "For businesses that can't afford a review to sit unanswered.", price: "$199", featured: true, tag: "Most chosen", features: ["Unlimited replies", "Reply within 24 hours", "Approvals by WhatsApp or email, one tap", "Weekly three-line results note", "Local keywords worked into replies"] }]} />
      <TrialForm title="Start your seven days, free." description="Send us your listing. Within a day, we'll have real replies drafted for your most recent unanswered reviews — free to look at either way." fields={[{ id: "biz", label: "Business name", placeholder: "e.g. Bella Italia Bistro" }, { id: "name", label: "Your name", placeholder: "e.g. Marco Rossi" }, { id: "contact", label: "Email or WhatsApp number", placeholder: "owner@business.com or phone" }, { id: "listing", label: "Google Maps or website link", placeholder: "Paste your listing link" }]} submitLabel="Start my free 7 days — no card needed" note="Zero commitment. If the replies aren't right for your voice, walk away — no questions." />
      <FAQSection title="Questions owners usually ask" items={[{ question: "Do you post anything without my permission?", answer: "Never. Every reply reaches you first, by WhatsApp or email. Approve as written, change a line, or skip it — you're always the last word." }, { question: "What happens during the free seven days?", answer: "We handle every review that comes in during that week, same as a paying week. If it's clearly saving you time, we send a simple link to continue at $99 or $199. If not, you owe nothing." }, { question: "Does this work for platforms besides Google?", answer: "Yes — Yelp, Facebook Pages, and TripAdvisor are covered on the Full Storefront plan." }, { question: "What if a review is abusive or clearly fake?", answer: "We flag it separately rather than drafting a normal reply, and let you know how to report it on the platform directly." }]} />
      <Footer text="Counterpart — the reply desk for businesses too busy to check reviews daily." copyright="© 2026 Counterpart" />
    </div>
  );
}

export default App;
