// netlify/functions/generate-booking-summary.js
const { respond } = require("./utils");
const { withFHJ } = require("./middleware");

function summarizeBooking(b) {
  const name = b.ClientName || "the client";
  const destination = b.Destination || "their destination";
  const start = b.StartDate || "the start date";
  const end = b.EndDate || "the end date";
  const total = b.TotalPrice ? `$${b.TotalPrice}` : "N/A";
  const paid = b.AmountPaid ? `$${b.AmountPaid}` : "N/A";
  const balance = b.BalanceDue ? `$${b.BalanceDue}` : "N/A";

  return `
${name} is booked for a trip to ${destination} from ${start} to ${end}.
The total trip cost is ${total}, of which ${paid} has been paid.
The remaining balance is ${balance}.
If needed, I can provide a breakdown of payments, documents, or itinerary details.
  `.trim();
}

exports.handler = withFHJ(async (event) => {
  const body = JSON.parse(event.body || "{}");
  const summary = summarizeBooking(body.booking || {});
  return respond(200, { summary });
});
