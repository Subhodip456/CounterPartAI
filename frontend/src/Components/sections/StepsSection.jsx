import { SectionHead, StepCard } from "../counterpart-landing";

export default function StepsSection({ title, description, steps = [] }) {
  return <section className="cp-steps-section" id="how"><div className="cp-wrap"><SectionHead title={title} description={description} /><div className="cp-steps">{steps.map((step, index) => <StepCard key={step.title} number={index + 1} {...step} />)}</div></div></section>;
}
