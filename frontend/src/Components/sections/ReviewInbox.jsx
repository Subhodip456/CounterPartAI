import { useEffect, useState } from "react";
import "./ReviewInbox.css";

async function api(path, body) {
  const response = await fetch(`http://localhost:4000/api/${path}`, body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request failed. Please try again.");
  return data;
}
async function allPages(path, field) {
  const items = [];
  let token = "";
  do {
    const data = await api(`${path}${path.includes("?") ? "&" : "?"}pageToken=${encodeURIComponent(token)}`);
    items.push(...(data[field] || []));
    token = data.nextPageToken || "";
  } while (token);
  return items;
}
function ReviewCard({ review, parent }) {
  const [draft, setDraft] = useState(review.reviewReply?.comment || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [approved, setApproved] = useState(false);
  const name = `${parent}/reviews/${review.reviewId}`;
  async function act(publish) {
    setBusy(true); setError(""); setMessage("");
    try {
      if (publish) {
        await api("google/reply", { name, comment: draft, approved });
        setMessage("Reply published to Google."); setApproved(false);
      } else {
        const result = await api("google/draft", { name });
        setApproved(false);
        setDraft(result.needsOwnerReview ? "" : result.reply);
        if (result.needsOwnerReview) setMessage("This review needs your attention. Write a reply yourself or report the review on Google.");
      }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <article className="cp-inbox-card">
    <h3>{review.reviewer?.displayName || "Google customer"}</h3>
    <p className="cp-inbox-meta">{review.starRating?.replaceAll("_", " ")} · {review.reviewReply ? "Has a public reply" : "Unanswered"}</p>
    <p className="cp-inbox-comment">{review.comment || "Rating only — no written comment."}</p>
    <button disabled={busy} onClick={() => act(false)}>Generate AI draft</button>
    <label className="cp-label" htmlFor={`reply-${review.reviewId}`}>Your reply</label>
    <textarea id={`reply-${review.reviewId}`} value={draft} maxLength={4096} disabled={busy} onChange={(e) => { setDraft(e.target.value); setApproved(false); setMessage(""); }} rows={5} />
    <label className="cp-inbox-approval"><input type="checkbox" checked={approved} disabled={busy || !draft.trim()} onChange={(e) => setApproved(e.target.checked)} /> I approve this exact reply for publication on Google{review.reviewReply ? ", replacing the existing reply" : ""}.</label>
    <button disabled={busy || !approved || !draft.trim()} onClick={() => act(true)}>{busy ? "Working…" : "Publish approved reply"}</button>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
  </article>;
}
export default function ReviewInbox() {
  const [session, setSession] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState("");
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState("");
  const [reviews, setReviews] = useState([]);
  const [nextPage, setNextPage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(() => {
    const issue = new URLSearchParams(window.location.search).get("google");
    return issue ? "Google connection was not completed. Please try connecting again and allow Business Profile access." : "";
  });
  useEffect(() => {
    let active = true;
    api("auth/session").then(async (value) => {
      if (!active) return;
      setSession(value);
      if (value.connected) {
        const list = await allPages("google/accounts", "accounts");
        if (active) setAccounts(list);
      }
    }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  async function selectAccount(value) {
    setAccount(value); setLocation(""); setLocations([]); setReviews([]); setLoaded(false); setNextPage(""); setError("");
    if (!value) return;
    setBusy(true);
    try { setLocations(await allPages(`google/locations?account=${encodeURIComponent(value)}`, "locations")); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function loadReviews(more = false) {
    setBusy(true); setError("");
    try {
      const data = await api(`google/reviews?${new URLSearchParams({ account, location, pageToken: more ? nextPage : "" })}`);
      setReviews((previous) => more ? [...previous, ...(data.reviews || [])] : data.reviews || []);
      setNextPage(data.nextPageToken || ""); setLoaded(true);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function disconnect() {
    setBusy(true); setError("");
    try { await api("auth/disconnect", {}); setSession({ configured: true, connected: false }); setReviews([]); setAccounts([]); setAccount(""); setLocation(""); setLocations([]); setLoaded(false); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <section id="inbox" className="cp-section"><div className="cp-wrap cp-inbox">
    <h2>Your Google review desk</h2>
    <p>Connect a Google account that manages your Business Profile. Choose a review, edit the draft, and approve it before publishing.</p>
    {error && <p role="alert">{error}</p>}
    {!session && !error && <p role="status">Checking your connection…</p>}
    {session && !session.connected && (session.configured ? <a className="cp-inbox-connect" href="/api/auth/google">Connect Google Business Profile</a> : <p role="status">Google connection is not available yet. Account setup is in progress.</p>)}
    {session?.connected && <>
      <div className="cp-inbox-toolbar"><strong>Google connected</strong><button disabled={busy} onClick={disconnect}>Disconnect Google</button><a href="/api/auth/google">Reconnect Google</a></div>
      <label className="cp-label" htmlFor="google-account">Business account</label>
      <select id="google-account" value={account} disabled={busy} onChange={(e) => selectAccount(e.target.value)}><option value="">Choose an account</option>{accounts.map((item) => <option key={item.name} value={item.name}>{item.accountName || item.name}</option>)}</select>
      <label className="cp-label" htmlFor="google-location">Business location</label>
      <select id="google-location" value={location} disabled={busy || !account} onChange={(e) => { setLocation(e.target.value); setReviews([]); setLoaded(false); setNextPage(""); }}><option value="">Choose a location</option>{locations.map((item) => <option key={item.name} value={item.name}>{item.title} {item.storefrontAddress?.locality || ""}</option>)}</select>
      <button disabled={busy || !location} onClick={() => loadReviews(false)}>Load reviews</button>
      {busy && <p role="status">Loading…</p>}
      {!busy && account && !locations.length && <p>No locations found in this account.</p>}
      {loaded && !reviews.length && <p>No reviews found for this location.</p>}
      <div className="cp-inbox-grid">{reviews.map((review) => <ReviewCard key={`${account}/${location}/${review.reviewId}/${review.reviewReply?.updateTime || ""}`} review={review} parent={`${account}/${location}`} />)}</div>
      {nextPage && <button disabled={busy} onClick={() => loadReviews(true)}>Load more reviews</button>}
    </>}
  </div></section>;
}
