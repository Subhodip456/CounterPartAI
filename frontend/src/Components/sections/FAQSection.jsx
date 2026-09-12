import { FAQItem, SectionHead } from "../counterpart-landing";

export default function FAQSection({ title, items = [] }) {
  return <section className="cp-section" id="faq"><div className="cp-wrap"><SectionHead title={title} /><div className="cp-faq-list">{items.map((item, index) => <FAQItem key={item.question} {...item} defaultOpen={index === 0} />)}</div></div></section>;
}
