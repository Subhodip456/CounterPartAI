# Counterpart API

Run `npm start` from this folder with Node 20+. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` before using AI drafting.

Endpoints:

- `GET /api/health` – service health check
- `POST /api/trials` – accepts the landing-page trial form
- `POST /api/replies/draft` – accepts `{ businessName, review, reviewerName?, tone? }` and returns an owner-reviewable reply

Trial requests are deliberately held in memory for this first local implementation; they disappear when the server restarts. Before deployment, add a database, authentication, encrypted contact storage, rate limiting, and a verified Google Business Profile OAuth integration. Google review monitoring and posting must use the business owner’s authorized Google account; this API never publishes a reply automatically.
