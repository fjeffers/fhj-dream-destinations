// ==========================================================
// FILE: fetchDeals.js — Fetch & normalize deals (Supabase)
// Location: src/utils/fetchDeals.js
// ==========================================================

const CATEGORY_FALLBACKS = {
  Cruise: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&q=80",
  Vacation: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  Event: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  Hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "Last-Minute": "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
};

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80";

function extractImage(deal) {
  // Check all possible field names (Supabase snake_case + legacy Airtable names)
  const urlFields = [
    "Place Image URL", "place_image_url",
    "Image URL", "image_url",
    "imageUrl", "image", "photo",
    "Photo", "Image", "Thumbnail",
  ];

  for (const field of urlFields) {
    const val = deal[field];
    if (typeof val === "string" && val.trim().length > 0) {
      const trimmed = val.trim();
      if (trimmed.startsWith("http") || trimmed.startsWith("data:") || trimmed.startsWith("/")) {
        return trimmed;
      }
    }
  }

  return null;
}

export async function fetchDeals() {
  try {
    const res = await fetch("/.netlify/functions/get-deals");
    const json = await res.json();
    const raw = Array.isArray(json) ? json : json.deals || json.records || [];

    return raw
      .filter((d) => {
        const active = d.Active ?? d.active ?? true;
        if (active === false || active === "Inactive" || active === "inactive") return false;
        return true;
      })
      .map((d) => {
        const category = d["Category"] || d.category || "";
        const image = extractImage(d) || CATEGORY_FALLBACKS[category] || DEFAULT_FALLBACK;

        return {
          id: d.id || d.ID || Math.random().toString(36).slice(2),
          title: d["Trip Name"] || d.trip_name || d.Name || d.name || d.Title || d.title || "Untitled Deal",
          category,
          price: d["Price"] || d.price || d.Amount || d.amount || null,
          image,
          notes: d["Notes"] || d.notes || d.description || "",
          active: true,
        };
      });
  } catch (err) {
    console.error("fetchDeals error:", err);
    return [];
  }
}

export default fetchDeals;