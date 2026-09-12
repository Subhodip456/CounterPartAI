import { useEffect, useState } from "react";
import { Button } from "../counterpart-landing";

export default function Nav({ brand = "Counterpart", links = [], ctaLabel = "Start free trial", ctaHref = "#trial" }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrolledState = () => setIsScrolled(window.scrollY > 56);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  return (
    <nav className={`cp-nav ${isScrolled ? "cp-nav-scrolled" : ""}`}>
      <div className="cp-nav-inner">
        <div className="cp-brand"><span className="cp-brand-mark" />{brand}</div>
        <div className="cp-nav-links">{links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
        <Button variant="primary" href={ctaHref} style={{ padding: "10px 20px", fontSize: "0.9rem" }}>{ctaLabel}</Button>
      </div>
    </nav>
  );
}
