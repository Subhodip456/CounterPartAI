import { fireEvent, render, screen } from "@testing-library/react";
import ReviewInbox from "./ReviewInbox";

test("drafting never publishes and editing clears approval", async () => {
  global.fetch = jest.fn(async (url, options) => {
    let data;
    if (url.includes("auth/session")) data = { connected: true, configured: true };
    else if (url.includes("google/accounts")) data = { accounts: [{ name: "accounts/1", accountName: "Test account" }] };
    else if (url.includes("google/locations")) data = { locations: [{ name: "locations/2", title: "Test shop" }] };
    else if (url.includes("google/reviews")) data = { reviews: [{ reviewId: "3", comment: "Great service", starRating: "FIVE", reviewer: { displayName: "Customer" } }] };
    else if (url.includes("google/draft")) data = { reply: "Thank you for visiting." };
    else if (url.includes("google/reply")) data = { comment: JSON.parse(options.body).comment };
    return { ok: true, json: async () => data };
  });
  render(<ReviewInbox />);
  await screen.findByRole("option", { name: "Test account" });
  fireEvent.change(screen.getByLabelText("Business account"), { target: { value: "accounts/1" } });
  await screen.findByRole("option", { name: "Test shop" });
  fireEvent.change(screen.getByLabelText("Business location"), { target: { value: "locations/2" } });
  fireEvent.click(screen.getByRole("button", { name: "Load reviews" }));
  fireEvent.click(await screen.findByRole("button", { name: "Generate AI draft" }));
  await screen.findByDisplayValue("Thank you for visiting.");
  const publish = screen.getByRole("button", { name: "Publish approved reply" });
  expect(publish).toBeDisabled();
  expect(global.fetch.mock.calls.some(([url]) => url.endsWith("google/reply"))).toBe(false);
  fireEvent.click(screen.getByRole("checkbox"));
  expect(publish).toBeEnabled();
  fireEvent.change(screen.getByLabelText("Your reply"), { target: { value: "Thank you, see you soon!" } });
  expect(publish).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(publish);
  expect(await screen.findByText("Reply published to Google.")).toBeInTheDocument();
  const [, request] = global.fetch.mock.calls.find(([url]) => url.endsWith("google/reply"));
  expect(JSON.parse(request.body)).toEqual({ name: "accounts/1/locations/2/reviews/3", comment: "Thank you, see you soon!", approved: true });
});
