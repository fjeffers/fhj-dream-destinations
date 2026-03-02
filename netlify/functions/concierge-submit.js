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

    // 2. Send email notifications via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      // Build a readable HTML transcript from the context field
      // Context format: "AI Discovery Chat:\n<Name>: msg\nConcierge AI: msg\n..."
      const transcriptLines = (context || "")
        .replace(/^AI Discovery Chat:\n?/, "")
        .split("\n")
        .filter(Boolean);

      const transcriptHtml = transcriptLines
        .map((line) => {
          const colonIdx = line.indexOf(": ");
          if (colonIdx === -1) return ""; // skip malformed lines
          const speaker = line.slice(0, colonIdx);
          const text = line.slice(colonIdx + 2);
          const isAI = speaker === "Concierge AI";
          const bg = isAI ? "#f8fafc" : "#f0fdf4";
          const borderColor = isAI ? "#94a3b8" : "#00c48c";
          const label = isAI
            ? `<strong style="color: #475569;">FHJ Concierge ✈️</strong>`
            : `<strong style="color: #047857;">${name || "You"}</strong>`;
          return `<div style="margin-bottom: 0.75rem; padding: 0.65rem 1rem; background: ${bg}; border-left: 3px solid ${borderColor}; border-radius: 0 8px 8px 0;">
            <div style="font-size: 11px; margin-bottom: 4px;">${label}</div>
            <div style="color: #1e293b; font-size: 14px; line-height: 1.5;">${text}</div>
          </div>`;
        })
        .join("");

      // 2a. Admin notification
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
            subject: `New Concierge Inquiry from ${name || "a visitor"}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00c48c; margin-bottom: 1.5rem;">✈️ New Concierge Inquiry</h2>
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
                  <p style="font-weight: bold; color: #555; margin-bottom: 0.5rem;">AI Summary:</p>
                  <blockquote style="border-left: 4px solid #00c48c; padding: 0.75rem 1rem; margin: 0; background: #f9f9f9; border-radius: 0 8px 8px 0; color: #333;">
                    ${message}
                  </blockquote>
                </div>
                ${transcriptHtml ? `<div style="margin-top: 1.5rem;"><p style="font-weight: bold; color: #555; margin-bottom: 0.75rem;">Full Conversation:</p>${transcriptHtml}</div>` : ""}
                <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #eee;" />
                <p style="color: #999; font-size: 0.8rem;">Sent from FHJ Dream Destinations concierge chat · <a href="https://fhjdreamdestinations.com/admin/concierge" style="color: #00c48c;">View in Admin</a></p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Admin email error (non-fatal):", emailErr);
      }

      // 2b. Client confirmation email with conversation transcript
      if (email) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "FHJ Dream Destinations <onboarding@resend.dev>",
              to: [email],
              subject: `Your Trip Inquiry — FHJ Dream Destinations`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
                  <div style="background: linear-gradient(135deg, #0a0a14, #1a1a2e); padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #00c48c; margin: 0; font-size: 1.5rem; letter-spacing: 0.05em;">FHJ Dream Destinations</h1>
                    <p style="color: #94a3b8; margin: 0.5rem 0 0; font-size: 0.95rem;">Your personal luxury travel concierge ✈️</p>
                  </div>

                  <div style="padding: 2rem;">
                    <p style="color: #1e293b; font-size: 1rem; line-height: 1.6;">
                      Hi <strong>${name || "there"}</strong>, 🌟
                    </p>
                    <p style="color: #1e293b; font-size: 1rem; line-height: 1.6;">
                      Thank you for sharing your travel dreams with us! We've received all the details from our conversation and our team is already excited to start crafting your perfect journey.
                    </p>
                    <p style="color: #1e293b; font-size: 1rem; line-height: 1.6;">
                      <strong>What happens next?</strong> A FHJ travel expert will review your inquiry and reach out within <strong>1–2 business days</strong> with personalised options tailored just for you.
                    </p>

                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.25rem; margin: 1.5rem 0;">
                      <p style="margin: 0; color: #047857; font-size: 0.9rem;">
                        📋 <strong>Your inquiry summary:</strong><br/>
                        <span style="color: #1e293b;">${message}</span>
                      </p>
                    </div>

                    ${transcriptHtml ? `
                    <details style="margin-top: 1.5rem;">
                      <summary style="cursor: pointer; color: #475569; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem;">
                        📝 View full conversation transcript
                      </summary>
                      <div style="margin-top: 0.75rem;">
                        ${transcriptHtml}
                      </div>
                    </details>
                    ` : ""}

                    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;" />

                    <p style="color: #64748b; font-size: 0.85rem; line-height: 1.6;">
                      Questions in the meantime? Reply to this email or reach us at
                      <a href="mailto:info@fhjdreamdestinations.com" style="color: #00c48c; text-decoration: none;">info@fhjdreamdestinations.com</a>.
                    </p>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.5rem;">
                      — The FHJ Dream Destinations Team 🌍
                    </p>
                  </div>

                  <div style="background: #f8fafc; padding: 1rem 2rem; border-radius: 0 0 12px 12px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 0.75rem; margin: 0;">
                      © FHJ Dream Destinations · <a href="https://fhjdreamdestinations.com" style="color: #00c48c; text-decoration: none;">fhjdreamdestinations.com</a>
                    </p>
                  </div>
                </div>
              `,
            }),
          });
        } catch (clientEmailErr) {
          console.error("Client confirmation email error (non-fatal):", clientEmailErr);
          // Don't fail the whole request if client email fails
        }
      }
    }

    return respond(200, { success: true, conciergeId: data?.id });
  } catch (err) {
    console.error("concierge-submit error:", err);
    return respond(500, { error: err.message });
  }
};
