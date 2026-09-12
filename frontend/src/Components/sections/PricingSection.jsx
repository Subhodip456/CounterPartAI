import { PricingPlan, SectionHead } from "../counterpart-landing";

export default function PricingSection({ title, description, plans = [] }) {
  return <section className="cp-section" id="pricing"><div className="cp-wrap"><SectionHead title={title} description={description} /><div className="cp-plans">{plans.map((plan) => <PricingPlan key={plan.name} {...plan} />)}</div></div></section>;
}
