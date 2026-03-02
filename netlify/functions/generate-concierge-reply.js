const { respond } = require("./utils");
const { withFHJ } = require("./middleware");

// Simple AI-style generator (rule-based for now)
function generateReply({ name, message, occasion, trip }) {
  const intro = `Hi ${name}, thanks so much for reaching out.`;

  let body = "";

  if (occasion) {
    body += ` I see you're planning something for ${occasion}. `;
  }

  if (trip) {
    body += ` Regarding your trip to ${trip}, I'd be happy to help with anything you need. `;
  }

  if (message) {
    body += ` About your message: "${message}", here's what I recommend. `;
  }

  const closing =
    "Let me know if you'd like me to arrange anything or provide more details.";

  return `${intro} ${body} ${closing}`;
}

exports.handler = withFHJ(async (event) => {
  const body = JSON.parse(event.body || "{}");

  const reply = generateReply({
    name: body.name || "there",
    message: body.message || "",
    occasion: body.occasion || "",
    trip: body.trip || "",
  });

  return respond(200, { reply });
});
