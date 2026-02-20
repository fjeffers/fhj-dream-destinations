const { respond } = require("./utils");
const { withFHJ } = require("./middleware");

// This is a placeholder — you can connect any LLM API here.
async function generateReply(messages) {
  const last = messages[messages.length - 1].content;

  // Simple rule-based assistant for now
  if (last.toLowerCase().includes("bookings")) {
    return "You can view bookings in the Bookings module. I can also summarize them if you want.";
  }

  if (last.toLowerCase().includes("clients")) {
    return "Clients can be managed in the Clients module. Let me know if you want a summary.";
  }

  if (last.toLowerCase().includes("concierge")) {
    return "The Concierge Inbox shows all incoming messages. I can help you draft replies.";
  }

  return "I'm here to help with FHJ operations — bookings, trips, clients, concierge, analytics, and more.";
}

exports.handler = withFHJ(async (event) => {
  const body = JSON.parse(event.body || "{}");
  const messages = body.messages || [];

  const reply = await generateReply(messages);

  return respond(200, { reply });
});
