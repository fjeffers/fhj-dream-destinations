const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  try {
    const { name, email, message, source, context } = JSON.parse(event.body || "{}");

    if (!message) return respond(400, { error: "Message is required" });

    // 1. Save to Supabase concierge table
    const { data, error } = await supabase
      .from("concierge")
      .insert([{
        name: name || "",
        email: email || "",
        message,
        source: source || "Chat Widget",
        context: context || "",
        status: "New",
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return respond(500, { error: error.message });
    }

    // 2. Send email notification via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FHJ Concierge <onboarding@resend.dev>",
            to: ["info@dreamdestinations.com"],
            subject: `New Concierge Message from ${name || "a visitor"}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00c48c;">New Concierge Message</h2>
                <p><strong>Name:</strong> ${name || "Not provided"}</p>
                <p><strong>Email:</strong> ${email || "Not provided"}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="border-left: 4px solid #00c48c; padding-left: 1rem; color: #333;">
                  ${message}
                </blockquote>
                <p><strong>Source:</strong> ${source || "Chat Widget"}</p>
                <hr />
                <p style="color: #999; font-size: 0.85rem;">Sent from FHJ Dream Destinations concierge chat</p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Resend email error (non-fatal):", emailErr);
        // Don't fail the whole request if email fails
      }
    }

    return respond(200, { success: true, conciergeId: data?.id });
  } catch (err) {
    console.error("concierge-submit error:", err);
    return respond(500, { error: err.message });
  }
};
