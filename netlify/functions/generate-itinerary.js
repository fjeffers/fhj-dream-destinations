// netlify/functions/generate-itinerary.js
const { respond } = require("./utils");
const { withFHJ } = require("./middleware");

function buildItinerary(trip) {
  const name = trip.ClientName || "the traveler";
  const destination = trip.Destination || "their destination";
  const start = trip.StartDate || "the start date";
  const end = trip.EndDate || "the end date";

  return `
Itinerary for ${name}
Destination: ${destination}
Dates: ${start} → ${end}

Day 1:
• Arrival at destination
• Hotel check‑in
• Light exploration or rest

Day 2:
• Guided city tour
• Visit major landmarks
• Dinner reservation arranged by FHJ Concierge

Day 3:
• Free day for personal activities
• Optional excursions available upon request

Day 4:
• Cultural experience (museum, market, or local event)
• Evening relaxation

Day 5:
• Scenic activity (beach, mountains, or nature walk)
• Sunset dinner

Day 6:
• Shopping or leisure
• Final concierge arrangements

Day 7:
• Checkout
• Airport transfer
• Departure
  `.trim();
}

exports.handler = withFHJ(async (event) => {
  const body = JSON.parse(event.body || "{}");
  const itinerary = buildItinerary(body.trip || {});
  return respond(200, { itinerary });
});
