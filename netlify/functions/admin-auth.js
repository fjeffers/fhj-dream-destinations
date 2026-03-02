// ==========================================================
// FILE: admin-auth.js
// Secure admin login: email + access code against "Admins" table
// Failed attempt tracking (locks after 5 bad tries for 15 min)
// Location: netlify/functions/admin-auth.js
// ==========================================================

const { selectRecords, respond, supabase } = require("./utils");

// In-memory lockout tracker (resets on redeploy)
const failedAttempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function isLockedOut(email) {
  const record = failedAttempts[email];
  if (!record) return false;
  if (record.count >= MAX_ATTEMPTS) {
    const elapsed = (Date.now() - record.lastAttempt) / 1000 / 60;
    if (elapsed < LOCKOUT_MINUTES) return true;
    delete failedAttempts[email];
    return false;
  }
  return false;
}

function recordFailure(email) {
  if (!failedAttempts[email]) {
    failedAttempts[email] = { count: 0, lastAttempt: 0 };
  }
  failedAttempts[email].count += 1;
  failedAttempts[email].lastAttempt = Date.now();
}

function clearFailures(email) {
  delete failedAttempts[email];
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { email, accessCode, pin } = body;
  const code = accessCode || pin || "";

  if (!email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Email is required." }) };
  }
  if (!code) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Access code is required." }) };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (isLockedOut(normalizedEmail)) {
    const remaining = Math.ceil(
      LOCKOUT_MINUTES - (Date.now() - failedAttempts[normalizedEmail].lastAttempt) / 1000 / 60
    );
    return {
      statusCode: 429, headers,
      body: JSON.stringify({ error: `Too many failed attempts. Try again in ${remaining} minutes.`, locked: true }),
    };
  }

  try {
    const admins = await selectRecords("Admins");
    console.log("Admins found:", admins.length);

    // Debug: log first admin's field names so we can see what Supabase returns
    if (admins.length > 0) {
      console.log("Admin record keys:", Object.keys(admins[0]).join(", "));
    }

    const admin = admins.find((a) => {
      const adminEmail = (a.Email || a.email || "").trim().toLowerCase();
      return adminEmail === normalizedEmail;
    });

    if (!admin) {
      recordFailure(normalizedEmail);
      console.log("No admin found for email:", normalizedEmail);
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid credentials." }) };
    }

    console.log("Admin found:", admin.name || admin.Name || admin.full_name || "unknown");
    console.log("Admin fields:", Object.keys(admin).join(", "));

    // Check all possible field names (Airtable-style + Supabase snake_case)
    const storedCode = (
      admin["Access Code"] ||
      admin["AccessCode"] ||
      admin.access_code ||
      admin.accessCode ||
      admin.PIN ||
      admin.Pin ||
      admin.pin ||
      admin.Password ||
      admin.password ||
      admin.code ||
      ""
    ).toString().trim();

    console.log("Stored code found:", storedCode ? "YES (length: " + storedCode.length + ")" : "NO");

    if (!storedCode) {
      console.log("No stored code found. Available fields:", JSON.stringify(admin, null, 2));
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Admin account not configured. Contact the owner." }) };
    }

    if (code.trim() !== storedCode) {
      recordFailure(normalizedEmail);
      const remaining = MAX_ATTEMPTS - (failedAttempts[normalizedEmail]?.count || 0);
      return {
        statusCode: 401, headers,
        body: JSON.stringify({
          error: remaining > 0
            ? `Invalid credentials. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Account locked. Try again later.",
        }),
      };
    }

    // Success
    clearFailures(normalizedEmail);

    const adminData = {
      id: admin.id || admin.recordId || "admin",
      Name: admin.Name || admin["Full Name"] || admin.name || admin.full_name || "",
      Email: admin.Email || admin.email || "",
      Role: admin.Role || admin.role || "Agent",
      AuthMode: admin["Auth Mode"] || admin.AuthMode || admin.auth_mode || "Code",
    };

    console.log("Login success for:", adminData.Name);

    // Sign in via Supabase Auth to obtain a JWT for subsequent admin API calls
    let token = null;
    try {
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: storedCode,
      });
      if (!signInError && sessionData && sessionData.session) {
        token = sessionData.session.access_token;
      }
    } catch (signInErr) {
      // Non-fatal: admin still authenticated via PIN; JWT will be unavailable
      console.warn("Supabase signIn failed (admin may not have a Supabase Auth account):", signInErr.message);
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, admin: { ...adminData, token } }),
    };

  } catch (err) {
    console.error("Admin auth error:", err);
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: "Authentication service unavailable. " + err.message }),
    };
  }
};