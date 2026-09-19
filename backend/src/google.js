import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { Router } from "express";
import { draftReply } from "./reviewReplyService.js";

const scope = "https://www.googleapis.com/auth/business.manage";
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const origin = () => process.env.APP_ORIGIN || "http://localhost:3000";
const callback = () => `${origin()}/api/auth/google/callback`;
const key = () => {
  if (!/^[a-f\d]{64}$/i.test(process.env.SESSION_SECRET || "")) throw fail("Google connection is not configured.", 503);
  return Buffer.from(process.env.SESSION_SECRET, "hex");
};
export function seal(value, purpose) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(purpose));
  return Buffer.concat([iv, cipher.update(JSON.stringify(value)), cipher.final(), cipher.getAuthTag()]).toString("base64url");
}
export function unseal(value, purpose) {
  try {
    const raw = Buffer.from(value || "", "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAAD(Buffer.from(purpose));
    decipher.setAuthTag(raw.subarray(-16));
    const data = JSON.parse(Buffer.concat([decipher.update(raw.subarray(12, -16)), decipher.final()]).toString());
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}
function cookie(request, name) {
  return request.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}
function setCookie(response, name, value, maxAge) {
  response.cookie(name, value, { httpOnly: true, secure: origin().startsWith("https:"), sameSite: "lax", path: "/api", maxAge });
}
function session(request) { return unseal(cookie(request, "cp_session"), "session"); }
export function requireGoogle(request, _response, next) {
  request.google = session(request);
  if (!request.google) return next(fail("Connect Google to continue. Your session may have expired.", 401));
  next();
}
export function sameOrigin(request, _response, next) {
  if (request.get("origin") !== origin()) return next(fail("Request origin is not allowed.", 403));
  next();
}
async function google(token, url, options = {}) {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(20000) });
  const data = await response.json();
  if (!response.ok) {
    const messages = { 401: "Google access expired or was revoked. Please reconnect.", 403: "Google denied access. Check Business Profile API approval, enabled APIs, and your access to this business.", 429: "Google's request limit was reached. Please try again later." };
    throw fail(messages[response.status] || "Google could not complete this request. Please try again.", messages[response.status] ? response.status : 502);
  }
  return data;
}
function resource(value, pattern) {
  if (typeof value !== "string" || !pattern.test(value)) throw fail("Invalid Google resource.");
  return value;
}
const accountName = (value) => resource(value, /^accounts\/[A-Za-z0-9_-]+$/);
const locationName = (value) => resource(value, /^locations\/[A-Za-z0-9_-]+$/);
const reviewName = (value) => resource(value, /^accounts\/[A-Za-z0-9_-]+\/locations\/[A-Za-z0-9_-]+\/reviews\/[A-Za-z0-9_-]+$/);
function pageToken(value) {
  if (value === undefined) return "";
  if (typeof value !== "string" || value.length > 4096) throw fail("Invalid page token.");
  return value;
}

export const googleRouter = Router();
googleRouter.use((_request, response, next) => { response.set("Cache-Control", "no-store"); response.set("Referrer-Policy", "no-referrer"); next(); });
googleRouter.get("/auth/session", (request, response) => response.json({ connected: Boolean(session(request)), configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && /^[a-f\d]{64}$/i.test(process.env.SESSION_SECRET || "")) }));
googleRouter.get("/auth/google", (_request, response) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) throw fail("Google connection is not configured.", 503);
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  setCookie(response, "cp_oauth", seal({ state, verifier, exp: Date.now() + 600000 }, "oauth"), 600000);
  const query = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: callback(), response_type: "code", scope, state, code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256", access_type: "online" });
  response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${query}`);
});
googleRouter.get("/auth/google/callback", async (request, response) => {
  const pending = unseal(cookie(request, "cp_oauth"), "oauth");
  setCookie(response, "cp_oauth", "", 0);
  if (!pending || typeof request.query.state !== "string" || pending.state !== request.query.state) return response.redirect(`${origin()}/?google=invalid_state#inbox`);
  if (request.query.error || typeof request.query.code !== "string") return response.redirect(`${origin()}/?google=denied#inbox`);
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: request.query.code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: callback(), grant_type: "authorization_code", code_verifier: pending.verifier }), signal: AbortSignal.timeout(20000) });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token || !token.scope?.split(" ").includes(scope)) throw fail("Google consent was incomplete.");
    // This interactive MVP deliberately does not request or retain offline refresh tokens.
    const duration = Math.min(Number(token.expires_in) || 3600, 3600) * 1000;
    const encrypted = seal({ token: token.access_token, exp: Date.now() + duration }, "session");
    if (encrypted.length > 3800) throw fail("Session is too large.");
    setCookie(response, "cp_session", encrypted, duration);
    response.redirect(`${origin()}/#inbox`);
  } catch { response.redirect(`${origin()}/?google=connection_failed#inbox`); }
});
googleRouter.post("/auth/disconnect", sameOrigin, requireGoogle, async (request, response) => {
  const revoked = await fetch("https://oauth2.googleapis.com/revoke", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token: request.google.token }), signal: AbortSignal.timeout(20000) });
  if (!revoked.ok && revoked.status !== 400) throw fail("Google could not disconnect. Please retry.", 502);
  setCookie(response, "cp_session", "", 0);
  response.json({ connected: false });
});
googleRouter.use("/google", requireGoogle);
googleRouter.get("/google/accounts", async (request, response) => {
  const query = new URLSearchParams({ pageSize: "20", pageToken: pageToken(request.query.pageToken) });
  response.json(await google(request.google.token, `https://mybusinessaccountmanagement.googleapis.com/v1/accounts?${query}`));
});
googleRouter.get("/google/locations", async (request, response) => {
  const account = accountName(request.query.account);
  const query = new URLSearchParams({ readMask: "name,title,storefrontAddress", pageSize: "100", pageToken: pageToken(request.query.pageToken) });
  response.json(await google(request.google.token, `https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations?${query}`));
});
googleRouter.get("/google/reviews", async (request, response) => {
  const parent = `${accountName(request.query.account)}/${locationName(request.query.location)}`;
  const query = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc", pageToken: pageToken(request.query.pageToken) });
  response.json(await google(request.google.token, `https://mybusiness.googleapis.com/v4/${parent}/reviews?${query}`));
});
googleRouter.post("/google/draft", sameOrigin, async (request, response) => {
  const name = reviewName(request.body?.name);
  // Retrieve the actual review with this user's token; never draft another tenant's data.
  const review = await google(request.google.token, `https://mybusiness.googleapis.com/v4/${name}`);
  const location = await google(request.google.token, `https://mybusinessbusinessinformation.googleapis.com/v1/${name.split("/").slice(2, 4).join("/")}?readMask=title`);
  response.json(await draftReply({ businessName: location.title, reviewerName: review.reviewer?.displayName, review: review.comment || `The customer left a ${review.starRating} rating without a written comment.`, tone: request.body.tone }));
});
googleRouter.post("/google/reply", sameOrigin, async (request, response) => {
  const name = reviewName(request.body?.name);
  const comment = typeof request.body.comment === "string" ? request.body.comment.trim() : "";
  if (request.body.approved !== true || !comment || comment.length > 4096 || comment === "FLAG_FOR_OWNER_REVIEW") throw fail("Approve a reply between 1 and 4096 characters before publishing.");
  response.json(await google(request.google.token, `https://mybusiness.googleapis.com/v4/${name}/reply`, { method: "PUT", body: JSON.stringify({ comment }) }));
});
