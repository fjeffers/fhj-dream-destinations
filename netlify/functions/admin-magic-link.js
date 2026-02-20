// ==========================================================
// 📄 FILE: admin-magic-link.js  (FIXED)
// ⭐ Removed React import — this is a backend function
// Location: netlify/functions/admin-magic-link.js
// ==========================================================

const { selectRecords, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { email } = body;

    if (!email) {
      return respond(400, { error: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up admin by email
    const admins = await selectRecords("Admins");
    const admin = admins.find((a) => {
      const adminEmail = (a.Email || a.email || "").trim().toLowerCase();
      return adminEmail === normalizedEmail;
    });

    if (!admin) {
      // Don't reveal if email exists or not
      return respond(200, {
        success: true,
        message: "If this email is registered, a magic link has been sent.",
      });
    }

    // Generate a simple token (in production, use crypto + store in DB with expiry)
    const token = Buffer.from(
      JSON.stringify({ email: normalizedEmail, ts: Date.now(), exp: Date.now() + 15 * 60 * 1000 })
    ).toString("base64url");

    // If Resend is configured, send the magic link email
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const siteUrl = process.env.URL || "https://fhjdreamdestinations.com";
      const magicUrl = `${siteUrl}/admin/magic?token=${token}`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FHJ Dream Destinations <notifications@fhjdreamdestinations.com>",
          to: [normalizedEmail],
          subject: "Your FHJ Admin Login Link",
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0a; color: #e5e7eb; border-radius: 16px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #00c48c, #00a67c); padding: 28px 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 20px;">Admin Login</h1>
              </div>
              <div style="padding: 32px; text-align: center;">
                <p style="color: #94a3b8; margin: 0 0 24px;">Click below to sign in. This link expires in 15 minutes.</p>
                <a href="${magicUrl}" style="display: inline-block; background: #00c48c; color: #000; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 15px;">
                  Sign In →
                </a>
                <p style="color: #475569; margin: 24px 0 0; font-size: 12px;">If you didn't request this, ignore this email.</p>
              </div>
            </div>
          `,
        }),
      });
    }

    return respond(200, {
      success: true,
      message: "If this email is registered, a magic link has been sent.",
    });

  } catch (err) {
    console.error("Magic link error:", err);
    return respond(500, { error: "Failed to send magic link." });
  }
};