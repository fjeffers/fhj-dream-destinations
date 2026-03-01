const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  try {
    const { name, email, phone, message, source, context } = JSON.parse(event.body || "{}");

    if (!message) return respond(400, { error: "Message is required" });

    // 1. Save to Supabase concierge table
    const { data, error } = await supabase
      .from("concierge")
      .insert([{
        name: name || "",
        email: email || "",
        phone: phone || "",
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
            to: ["info@fhjdreamdestinations.com"],
            subject: `New Concierge Message from ${name || "a visitor"}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00c48c; margin-bottom: 1.5rem;">✈️ New Concierge Message</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0.5rem 0; font-weight: bold; width: 100px; color: #555;">Name:</td>
                    <td style="padding: 0.5rem 0;">${name || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.5rem 0; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 0.5rem 0;"><a href="mailto:${email}" style="color: #00c48c;">${email || "Not provided"}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 0.5rem 0; font-weight: bold; color: #555;">Phone:</td>
                    <td style="padding: 0.5rem 0;"><a href="tel:${phone}" style="color: #00c48c;">${phone || "Not provided"}</a></td>
                  </tr>
                </table>
                <div style="margin-top: 1.5rem;">
                  <p style="font-weight: bold; color: #555; margin-bottom: 0.5rem;">Message:</p>
                  <blockquote style="border-left: 4px solid #00c48c; padding: 0.75rem 1rem; margin: 0; background: #f9f9f9; border-radius: 0 8px 8px 0; color: #333;">
                    ${message}
                  </blockquote>
                </div>
                <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #eee;" />
                <p style="color: #999; font-size: 0.8rem;">Sent from FHJ Dream Destinations concierge chat · <a href="https://fhjdreamdestinations.com/admin/concierge" style="color: #00c48c;">View in Admin</a></p>
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
