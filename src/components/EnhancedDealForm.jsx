import React, { useState } from "react";
import { FHJButton } from "./FHJ/FHJUIKit";

// ArrayInput component for highlights, inclusions, exclusions
function ArrayInput({ label, value = [], onChange, placeholder }) {
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
    if (inputValue.trim()) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{ display: "block", color: "#cbd5e1", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
        {label}
      </label>
      
      {/* Display existing items */}
      {value.length > 0 && (
        <div style={{ marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {value.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(0,196,140,0.1)",
                border: "1px solid rgba(0,196,140,0.3)",
                borderRadius: "8px",
                padding: "0.5rem 0.75rem",
                fontSize: "0.9rem",
                color: "#e2e8f0"
              }}
            >
              <span>{item}</span>
              <button
                onClick={() => removeItem(idx)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f87171",
                  cursor: "pointer",
                  padding: "0",
                  fontSize: "1.2rem",
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input for new items */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
          style={{
            flex: 1,
            padding: "0.75rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "white",
            fontSize: "0.95rem"
          }}
        />
        <button
          onClick={addItem}
          type="button"
          style={{
            padding: "0.75rem 1.5rem",
            background: "rgba(0,196,140,0.2)",
            border: "1px solid rgba(0,196,140,0.4)",
            borderRadius: "8px",
            color: "#00c48c",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem"
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

// Main Enhanced Deal Form
export default function EnhancedDealForm({ deal = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    tripName: deal?.trip_name || "",
    category: deal?.category || "Cruise",
    price: deal?.price || "",
    imageUrl: deal?.place_image_url || "",
    description: deal?.notes || "",
    active: deal?.active !== false,
    
    // Enhanced fields
    duration: deal?.duration || "",
    location: deal?.location || "",
    departureDates: deal?.departure_dates || "",
    highlights: deal?.highlights ? (typeof deal.highlights === 'string' ? JSON.parse(deal.highlights) : deal.highlights) : [],
    itinerary: deal?.itinerary || "",
    inclusions: deal?.inclusions ? (typeof deal.inclusions === 'string' ? JSON.parse(deal.inclusions) : deal.inclusions) : [],
    exclusions: deal?.exclusions ? (typeof deal.exclusions === 'string' ? JSON.parse(deal.exclusions) : deal.exclusions) : [],
    additionalImages: deal?.additional_images ? (typeof deal.additional_images === 'string' ? JSON.parse(deal.additional_images) : deal.additional_images) : [],
    accommodation: deal?.accommodation || "",
    maxGuests: deal?.max_guests || 2,
    difficultyLevel: deal?.difficulty_level || "Easy",
    bestTimeToVisit: deal?.best_time_to_visit || "",
    depositRequired: deal?.deposit_required || "",
    featured: deal?.featured || false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      "Trip Name": formData.tripName,
      "Category": formData.category,
      "Price": formData.price,
      "Place Image URL": formData.imageUrl,
      "Notes": formData.description,
      "Active": formData.active,
      "Duration": formData.duration,
      "Location": formData.location,
      "Departure Dates": formData.departureDates,
      "Highlights": formData.highlights,
      "Itinerary": formData.itinerary,
      "Inclusions": formData.inclusions,
      "Exclusions": formData.exclusions,
      "Additional Images": formData.additionalImages,
      "Accommodation": formData.accommodation,
      "Max Guests": parseInt(formData.maxGuests) || 2,
      "Difficulty Level": formData.difficultyLevel,
      "Best Time to Visit": formData.bestTimeToVisit,
      "Deposit Required": formData.depositRequired ? parseFloat(formData.depositRequired) : null,
      "Featured": formData.featured,
    };

    if (deal?.id) {
      payload.id = deal.id;
    }

    await onSave(payload);
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "white",
    fontSize: "0.95rem",
    marginTop: "0.5rem"
  };

  const labelStyle = {
    display: "block",
    color: "#cbd5e1",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: 500
  };

  const sectionStyle = {
    marginBottom: "2rem",
    padding: "1.5rem",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.05)"
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "900px" }}>
      
      {/* BASIC INFORMATION */}
      <div style={sectionStyle}>
        <h3 style={{ color: "#00c48c", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Basic Information</h3>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Trip Name *</label>
          <input
            type="text"
            value={formData.tripName}
            onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
            placeholder="e.g., Santorini Getaway"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={inputStyle}
            >
              <option value="Cruise">Cruise</option>
              <option value="Beach">Beach</option>
              <option value="Vacation">Vacation</option>
              <option value="Event">Event</option>
              <option value="Hotels">Hotels</option>
              <option value="Last-Minute">Last-Minute</option>
              <option value="Adventure">Adventure</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Price ($) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="2500"
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Main Image URL *</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the deal..."
            required
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>

      {/* TRIP DETAILS */}
      <div style={sectionStyle}>
        <h3 style={{ color: "#00c48c", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Trip Details</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 7 Days / 6 Nights"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Montego Bay, Jamaica"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Departure Dates</label>
          <input
            type="text"
            value={formData.departureDates}
            onChange={(e) => setFormData({ ...formData, departureDates: e.target.value })}
            placeholder="e.g., March 15, April 12, May 20"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Max Guests</label>
            <input
              type="number"
              value={formData.maxGuests}
              onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
              min="1"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Difficulty Level</label>
            <select
              value={formData.difficultyLevel}
              onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
              style={inputStyle}
            >
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Challenging">Challenging</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Deposit ($)</label>
            <input
              type="number"
              value={formData.depositRequired}
              onChange={(e) => setFormData({ ...formData, depositRequired: e.target.value })}
              placeholder="500"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Best Time to Visit</label>
          <input
            type="text"
            value={formData.bestTimeToVisit}
            onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
            placeholder="e.g., December - April"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Accommodation Details</label>
          <textarea
            value={formData.accommodation}
            onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
            placeholder="Describe the hotel/resort..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>

      {/* HIGHLIGHTS & INCLUSIONS */}
      <div style={sectionStyle}>
        <h3 style={{ color: "#00c48c", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Highlights & Inclusions</h3>

        <ArrayInput
          label="Highlights"
          value={formData.highlights}
          onChange={(val) => setFormData({ ...formData, highlights: val })}
          placeholder="e.g., All-inclusive resort"
        />

        <ArrayInput
          label="What's Included"
          value={formData.inclusions}
          onChange={(val) => setFormData({ ...formData, inclusions: val })}
          placeholder="e.g., Round-trip flights"
        />

        <ArrayInput
          label="What's NOT Included"
          value={formData.exclusions}
          onChange={(val) => setFormData({ ...formData, exclusions: val })}
          placeholder="e.g., Travel insurance"
        />
      </div>

      {/* ITINERARY */}
      <div style={sectionStyle}>
        <h3 style={{ color: "#00c48c", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Itinerary</h3>
        
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Day-by-Day Schedule</label>
          <textarea
            value={formData.itinerary}
            onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
            placeholder="Day 1: Arrival...&#10;Day 2-6: Activities...&#10;Day 7: Departure"
            rows={6}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace" }}
          />
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
            Press Enter for line breaks between days
          </p>
        </div>
      </div>

      {/* ADDITIONAL IMAGES */}
      <div style={sectionStyle}>
        <h3 style={{ color: "#00c48c", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Additional Images</h3>
        
        <ArrayInput
          label="Image URLs"
          value={formData.additionalImages}
          onChange={(val) => setFormData({ ...formData, additionalImages: val })}
          placeholder="https://images.unsplash.com/..."
        />
        <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
          Add 2-4 extra images to create an image gallery on the detail page
        </p>
      </div>

      {/* SETTINGS */}
      <div style={sectionStyle}>
        <h3 style={{ color: "#00c48c", marginBottom: "1.5rem", fontSize: "1.2rem" }}>Settings</h3>

        <div style={{ display: "flex", gap: "2rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>Active</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>Featured Deal</span>
          </label>
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "0.75rem 2rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#cbd5e1",
            cursor: "pointer",
            fontSize: "0.95rem"
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: "0.75rem 2rem",
            background: "#00c48c",
            border: "none",
            borderRadius: "8px",
            color: "#000",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: 600
          }}
        >
          {deal ? "Update Deal" : "Create Deal"}
        </button>
      </div>
    </form>
  );
}