// ==========================================================
// FILE: update-about.js
// Update About Page Content in Supabase
// Location: netlify/functions/update-about.js
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const content = {
      hero_title: body.hero_title || "",
      hero_subtitle: body.hero_subtitle || "",
      philosophy_title: body.philosophy_title || "",
      philosophy_text_1: body.philosophy_text_1 || "",
      philosophy_text_2: body.philosophy_text_2 || "",
      pillar_1_title: body.pillar_1_title || "",
      pillar_1_text: body.pillar_1_text || "",
      pillar_2_title: body.pillar_2_title || "",
      pillar_2_text: body.pillar_2_text || "",
      pillar_3_title: body.pillar_3_title || "",
      pillar_3_text: body.pillar_3_text || "",
      founder_name: body.founder_name || "",
      founder_phone: body.founder_phone || "",
      founder_email: body.founder_email || "",
      founder_bio: body.founder_bio || "",
      founder_quote: body.founder_quote || "",
      cta_title: body.cta_title || "",
      cta_subtitle: body.cta_subtitle || "",
      updated_at: new Date().toISOString(),
    };

    // Check if content exists
    const { data: existing } = await supabase
      .from("about_page")
      .select("id")
      .single();

    let result;

    if (existing) {
      // Update existing
      result = await supabase
        .from("about_page")
        .update(content)
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // Insert new
      result = await supabase
        .from("about_page")
        .insert([content])
        .select()
        .single();
    }

    if (result.error) {
      console.error("Supabase error:", result.error);
      return respond(500, { error: result.error.message });
    }

    return respond(200, {
      success: true,
      content: result.data
    });
  } catch (err) {
    console.error("Update about error:", err);
    return respond(500, { error: err.message });
  }
};
