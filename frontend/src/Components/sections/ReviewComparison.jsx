import { ReviewTicket, SectionHead } from "../counterpart-landing";

export default function ReviewComparison({ title, description, badReview, goodReview }) {
  return <section className="cp-section" id="compare"><div className="cp-wrap"><SectionHead title={title} description={description} /><div className="cp-tickets"><ReviewTicket statusType="bad" {...badReview} /><ReviewTicket statusType="good" {...goodReview} /></div></div></section>;
}
