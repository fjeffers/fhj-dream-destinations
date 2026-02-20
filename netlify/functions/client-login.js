// ==========================================================
// 📄 FILE: client-login.js  (PHASE 1 FIX)
// ⭐ FIX: Removed duplicate handler definition
//    Previously had two exports.handler in the same file,
//    second one silently overwrote the first.
// ==========================================================

const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  try {
    // 2. Safely parse the body
    let body = {};
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      return respond(400, {
        success: false,
        error: "Invalid request format.",
      });
    }

    const email = body.email;
    const accessCode = body.accessCode;

    // 3. Check if they typed both in
    if (!email || !accessCode) {
      return respond(400, {
        success: false,
        error: "Email and Access Code are required.",
      });
    }

    // 4. Query Airtable
    // Using exact column names "Client Email" and "Client PIN"
    const formula = `AND(LOWER({Client Email})='${String(email).toLowerCase()}', {Client PIN}='${accessCode}')`;

    // Querying the "Client Login" table
    const records = await selectRecords("Client Login", formula, {
      maxRecords: 1,
    });

    // 5. Did we find them?
    if (records && records.length > 0) {
      const record = records[0];

      // Build the client object
      // Handle both flattened (normalizer applied) and nested field formats
      const fields = record.fields || record;

      const client = {
        id: record.id,
        email: fields["Client Email"] || email,
        fullName:
          fields["Full Name"] ||
          fields["Client Name"] ||
          "Traveler",
        phone: fields["Phone"] || "",
      };

      return respond(200, { success: true, client });
    } else {
      return respond(401, {
        success: false,
        error: "Invalid email or access code.",
      });
    }
  } catch (error) {
    console.error("Critical Login Error:", error);
    return respond(500, {
      success: false,
      error: "Server error. Please try again later.",
    });
  }
});
