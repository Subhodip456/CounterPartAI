const OPENAI_URL = "https://api.openai.com/v1/responses";

function cleanText(value, field, limit = 4000) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required.`);
  return value.trim().slice(0, limit);
}

export function validateDraftInput(input = {}) {
  return {
    businessName: cleanText(input.businessName, "Business name", 120),
    review: cleanText(input.review, "Review"),
    tone: typeof input.tone === "string" ? input.tone.trim().slice(0, 240) : "warm, direct, and accountable",
    reviewerName: typeof input.reviewerName === "string" ? input.reviewerName.trim().slice(0, 80) : "",
  };
}

export async function draftReply(input) {
  const review = validateDraftInput(input);
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("AI drafting is not configured. Add OPENAI_API_KEY to backend/.env.");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(OPENAI_URL, {
    signal: AbortSignal.timeout(30000),
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL,
      store: false,
      instructions: "You draft public replies to business reviews. Return only the ready-to-publish reply, no title or quotation marks. Be empathetic, specific where supported, concise (60–110 words), and never invent remedies, events, policies, or facts. Do not promise a refund, discount, or future action unless the review input explicitly supplies it. If the review is abusive, threatening, discriminatory, or clearly a fake-review allegation, return exactly: FLAG_FOR_OWNER_REVIEW.",
      input: `Business: ${review.businessName}\nPreferred tone: ${review.tone}\nReviewer name: ${review.reviewerName || "not provided"}\nReview:\n${review.review}`,
      max_output_tokens: 220,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body?.error?.message || "The AI provider could not draft a reply.");
    error.statusCode = 502;
    throw error;
  }
  const reply = (body.output_text || body.output?.filter((item) => item.type === "message").flatMap((item) => item.content || []).filter((item) => item.type === "output_text").map((item) => item.text).join("\n"))?.trim();
  if (!reply) throw new Error("The AI provider returned an empty reply.");
  return { reply, needsOwnerReview: reply === "FLAG_FOR_OWNER_REVIEW" };
}
