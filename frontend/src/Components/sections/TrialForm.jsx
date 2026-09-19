import { useState } from "react";
import { Button } from "../counterpart-landing";


export default function TrialForm({ title, description, fields = [], submitLabel, note }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.id, ""])));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const response = await fetch(`/api/trials`, { headers: { "Content-Type": "application/json" }, method: "POST", body: JSON.stringify(values) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "We could not start your trial.");
      setStatus("success");
    } catch (requestError) {
      setError(requestError.message || "We could not start your trial.");
      setStatus("idle");
    }
  }

  return <section className="cp-section" id="trial"><div className="cp-wrap"><div className="cp-form-card"><h2>{title}</h2><p>{description}</p>
    {status === "success" ? <div className="cp-form-success" style={{ marginTop: "32px" }}>Got it — you’ll hear from us within a day.</div> : <form className="cp-form-grid" onSubmit={handleSubmit}>
      {fields.map((field) => <div key={field.id}><label className="cp-label" htmlFor={field.id}>{field.label}</label><input required className="cp-input" id={field.id} type="text" placeholder={field.placeholder} value={values[field.id]} onChange={(event) => setValues({ ...values, [field.id]: event.target.value })} /></div>)}
      {error && <p role="alert" className="cp-ticket-empty">{error}</p>}
      <Button variant="primary" style={{ width: "100%", marginTop: "8px", padding: "15px", fontSize: "1rem" }}>{status === "submitting" ? "Starting your trial…" : submitLabel}</Button>
    </form>}
    {note && <p className="cp-form-note">{note}</p>}
  </div></div></section>;
}
