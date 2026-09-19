import test, { after } from "node:test";
import assert from "node:assert/strict";
import { app } from "./server.js";
import { seal, unseal } from "./google.js";
import { draftReply } from "./reviewReplyService.js";

process.env.SESSION_SECRET = "ab".repeat(32);
process.env.APP_ORIGIN = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-client";
process.env.GOOGLE_CLIENT_SECRET = "test-secret";
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const realFetch = globalThis.fetch;
const headers = () => ({ origin: process.env.APP_ORIGIN, "Content-Type": "application/json", cookie: `cp_session=${seal({ token: "test-google-token", exp: Date.now() + 60000 }, "session")}` });
after(() => server.close());

test("encrypted sessions reject tampering, wrong purpose, and expiry", () => {
  const encrypted = seal({ token: "private", exp: Date.now() + 60000 }, "session");
  assert.equal(unseal(encrypted, "session").token, "private");
  assert.equal(unseal(encrypted, "oauth"), null);
  assert.equal(unseal(`AAAA${encrypted.slice(4)}`, "session"), null);
  assert.equal(unseal(seal({ exp: Date.now() - 1 }, "session"), "session"), null);
});
test("anonymous review access and public draft access are rejected", async () => {
  assert.equal((await realFetch(`${base}/api/google/accounts`)).status, 401);
  assert.equal((await realFetch(`${base}/api/replies/draft`, { method: "POST", headers: { origin: process.env.APP_ORIGIN, "Content-Type": "application/json" }, body: "{}" })).status, 401);
});
test("OAuth begins with state, PKCE and HttpOnly cookie; bad callback state is rejected", async () => {
  const response = await realFetch(`${base}/api/auth/google`, { redirect: "manual" });
  const target = new URL(response.headers.get("location"));
  assert.equal(target.hostname, "accounts.google.com");
  assert.ok(target.searchParams.get("state"));
  assert.equal(target.searchParams.get("code_challenge_method"), "S256");
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
  assert.equal(target.searchParams.get("redirect_uri"), "http://localhost:3000/api/auth/google/callback");
  const callback = await realFetch(`${base}/api/auth/google/callback?state=wrong&code=wrong`, { redirect: "manual" });
  assert.match(callback.headers.get("location"), /invalid_state/);
});
test("cross-origin writes, missing approval and invalid paths never reach Google", async () => {
  const body = { name: "accounts/1/locations/2/reviews/3", comment: "Thank you" };
  assert.equal((await realFetch(`${base}/api/google/reply`, { method: "POST", headers: { ...headers(), origin: "https://evil.example" }, body: JSON.stringify({ ...body, approved: true }) })).status, 403);
  assert.equal((await realFetch(`${base}/api/google/reply`, { method: "POST", headers: headers(), body: JSON.stringify(body) })).status, 400);
  assert.equal((await realFetch(`${base}/api/google/reply`, { method: "POST", headers: headers(), body: JSON.stringify({ ...body, name: "../../other", approved: true }) })).status, 400);
});
test("approved reply uses this session's token and the documented PUT endpoint", async () => {
  let called = false;
  globalThis.fetch = async (url, options) => {
    called = true;
    assert.equal(url, "https://mybusiness.googleapis.com/v4/accounts/1/locations/2/reviews/3/reply");
    assert.equal(options.method, "PUT");
    assert.equal(options.headers.Authorization, "Bearer test-google-token");
    assert.deepEqual(JSON.parse(options.body), { comment: "Thank you" });
    return Response.json({ comment: "Thank you" });
  };
  try {
    const response = await realFetch(`${base}/api/google/reply`, { method: "POST", headers: headers(), body: JSON.stringify({ name: "accounts/1/locations/2/reviews/3", comment: "Thank you", approved: true }) });
    assert.equal(response.status, 200); assert.ok(called);
  } finally { globalThis.fetch = realFetch; }
});
test("raw Responses API message content is extracted", async () => {
  process.env.OPENAI_API_KEY = "test-only";
  globalThis.fetch = async () => Response.json({ output: [{ type: "reasoning" }, { type: "message", content: [{ type: "output_text", text: "Thanks for your feedback." }] }] });
  try { assert.equal((await draftReply({ businessName: "Test shop", review: "Lovely service" })).reply, "Thanks for your feedback."); }
  finally { globalThis.fetch = realFetch; delete process.env.OPENAI_API_KEY; }
});

test("valid OAuth callback exchanges code and stores no plaintext access token", async () => {
  const start = await realFetch(`${base}/api/auth/google`, { redirect: "manual" });
  const state = new URL(start.headers.get("location")).searchParams.get("state");
  const pendingCookie = start.headers.get("set-cookie").split(";")[0];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://oauth2.googleapis.com/token");
    assert.equal(options.body.get("code"), "test-code");
    assert.ok(options.body.get("code_verifier"));
    return Response.json({ access_token: "private-google-token", expires_in: 3600, scope: "https://www.googleapis.com/auth/business.manage" });
  };
  try {
    const response = await realFetch(`${base}/api/auth/google/callback?state=${state}&code=test-code`, { headers: { cookie: pendingCookie }, redirect: "manual" });
    assert.equal(response.headers.get("location"), "http://localhost:3000/#inbox");
    const cookies = response.headers.getSetCookie();
    const authCookie = cookies.find((value) => value.startsWith("cp_session="));
    assert.ok(authCookie); assert.ok(!authCookie.includes("private-google-token"));
    const status = await realFetch(`${base}/api/auth/session`, { headers: { cookie: authCookie.split(";")[0] } });
    assert.equal((await status.json()).connected, true);
  } finally { globalThis.fetch = realFetch; }
});

test("Netlify function accepts original and rewritten API paths", async () => {
  const { handler } = await import("./netlifyHandler.js");
  for (const path of ["/api/health", "/.netlify/functions/api/health"]) {
    const response = await handler({ path, httpMethod: "GET", headers: {}, body: null }, {});
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { ok: true });
  }
});
