# Counterpart: Google integration setup and project audit

## Implemented locally

- Google authorization code flow with state validation and PKCE.
- AES-256-GCM encrypted, HttpOnly, SameSite cookies; Secure on HTTPS.
- Account and location selectors, paginated reviews, AI drafts, editable replies, and explicit publish approval.
- Google validates resource permissions using each connected user's own access token.
- Disconnect revokes Google access. Writes require the configured application origin.
- Local frontend API proxy and Netlify function path normalization.
- Existing AI draft endpoint now requires a Google session; raw Responses API output parsing is fixed.

This is an interactive integration milestone, not a finished subscription service. No live Google credentials were supplied, and no live review has been published or edited during development.

## Google Cloud setup

1. Create or select a Google Cloud project. Request Business Profile API access for that project and wait for approval. OAuth consent alone does not grant API access.
2. Enable **My Business Account Management API**, **My Business Business Information API**, and **Google My Business API** (reviews and replies use its v4 endpoints). Google may require other Business Profile APIs as described in its basic setup guide.
3. Configure Google Auth Platform branding, audience, and data access. Add the scope `https://www.googleapis.com/auth/business.manage`. Use a real support email, authorized domain, homepage, privacy policy, and terms suitable for the service. Add your test account while the app is in testing. Complete the applicable verification before public onboarding.
4. Create an OAuth client of type **Web application**. Register these exact redirect URIs:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Netlify: `https://counterpartai.netlify.app/api/auth/google/callback`
5. The connecting Google account must own or manage the intended Business Profile. Reviews require a verified location.

## Local configuration

Copy `backend/.env.example` to `backend/.env`. Fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`, and `SESSION_SECRET`. Generate the latter with the command in the example. Never commit or put secrets in frontend variables.

Use Node 22. Start the API with `npm start` in `backend`, then `npm start` in `frontend`. Visit `http://localhost:3000/#inbox`. The frontend proxies `/api` to port 4000, including the OAuth callback. Both servers must run. If changing the backend port, update the frontend proxy too.

## Netlify configuration

Set the same secrets in Netlify's server-side function environment. Set both `APP_ORIGIN` and `FRONTEND_ORIGIN` to `https://counterpartai.netlify.app` with no trailing slash. Keep the session secret consistent across function instances. Redeploy after configuration. Preview domains require separate explicit origin/redirect configuration; do not use wildcard OAuth redirects.

No deployment or Git push was performed by this change. Local main was six commits behind origin/main at the start; reconcile those existing remote changes before pushing.

## Verification

- Backend: `npm test` in `backend` (mocked external providers; no live posting).
- Frontend: `npm test -- --watchAll=false --runInBand` and `npm run build` in `frontend`.
- After configuring Google: connect with a test manager account, select an account/location, load multiple review pages, draft a reply and edit it. Confirm editing clears approval. Publish only a reply you actually intend to make public, then verify it in Google Business Profile. Test denied consent, expired access, disconnect, and accounts without locations.

## Remaining work before production launch

- Durable database for users, businesses, encrypted refresh tokens, trials, drafts, approvals, and audit history. Trial submissions currently live only in a process array and can be lost on restart or serverless cold starts.
- This milestone intentionally requests online access only. Sessions last at most one hour and require reconnection afterward. There are no refresh tokens or unattended monitoring. Add server-side revocable sessions and encrypted offline token storage before scheduled work.
- Scheduled review ingestion or Pub/Sub notifications, deduplication, durable job queues and retry handling.
- Email/WhatsApp delivery and authenticated approval links; weekly reports.
- Billing, subscription entitlements, per-business usage limits, and distributed rate limits for paid AI calls. Authentication alone is not a usage quota.
- Conflict detection and audit records when replacing existing replies; drafts currently stay only in the open browser component and are lost on reload.
- Privacy/data deletion flows, retention policy, Google verification, and appropriate production monitoring.
- Correct marketing claims: the current landing page promises instant monitoring, WhatsApp/email approvals, weekly reports, billing plans, and Yelp/Facebook/TripAdvisor support that are not implemented. Examples also show five stars on negative reviews and promise remedies that must be fact-checked. The deployed document title still says “React App”.

## Official references

- [Business Profile prerequisites](https://developers.google.com/my-business/content/prereqs)
- [Basic setup](https://developers.google.com/my-business/content/basic-setup)
- [OAuth for web servers](https://developers.google.com/identity/protocols/oauth2/web-server)
- [List locations](https://developers.google.com/my-business/reference/businessinformation/rest/v1/accounts.locations/list)
- [List reviews](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list)
- [Publish or update a reply](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/updateReply)
