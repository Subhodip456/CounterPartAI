import express from "express";
import { draftReply } from "./reviewReplyService.js";

const port = Number(process.env.PORT);
const allowedOrigin = process.env.FRONTEND_ORIGIN ;
const trialRequests = [];
const app = express();

app.use(express.json({ limit: "50kb" }));
app.use((request, response, next) => {
  response.set({ "Access-Control-Allow-Origin": allowedOrigin, "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});

function validateTrial(input) {
  const values = Object.fromEntries(["biz", "name", "contact", "listing"].map((key) => [key, typeof input[key] === "string" ? input[key].trim() : ""]));
  if (Object.values(values).some((value) => !value)) throw new Error("Business name, owner name, contact, and listing are required.");
  if (values.listing.length > 2_000 || Object.values(values).some((value) => value.length > 500)) throw new Error("One of the submitted fields is too long.");
  return values;
}

app.get("/api/health", (_request, response) => response.json({ ok: true }));

app.post("/api/trials", (request, response, next) => {
  try {
    const trial = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...validateTrial(request.body) };
    trialRequests.push(trial);
    response.status(201).json({ id: trial.id, message: "Trial request received." });
  } catch (error) {
    next(error);
  }
});

app.post("/api/replies/draft", async (request, response, next) => {
  try { response.json(await draftReply(request.body)); } catch (error) { next(error); }
});

app.use((_request, _response, next) => next(Object.assign(new Error("Route not found."), { statusCode: 404 })));
app.use((error, _request, response, _next) => response.status(error.statusCode || 400).json({ error: error.message || "Unexpected server error." }));

// app.listen(port, () => console.log(`Counterpart API listening at http://localhost:${port}`));
if (!process.env.NETLIFY) {
  app.listen(port, () => {
    console.log(
      `Counterpart API listening at http://localhost:${port}`
    );
  });
}

export { app };
