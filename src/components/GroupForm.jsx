import React, { useState } from "react";

const INITIAL_STATE = { fullName: "", email: "", occasion: "Wedding", groupSize: "", destination: "", notes: "", tripType: "" };

export default function GroupForm({ type }) {
  const [form, setForm] = useState({ ...INITIAL_STATE, tripType: type === "group" ? "Group Trip" : "Event" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/intake-submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus("Success! We'll be in touch."); setForm({...INITIAL_STATE, tripType: type === "group" ? "Group Trip" : "Event"}); }
      else throw new Error();
    } catch { setStatus("Error sending request."); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", padding: "40px", borderRadius: "24px", maxWidth: "600px", margin: "0 auto", color: "white"}}>
      <h2 style={{textAlign: "center", marginBottom: "20px"}}>PLAN A <span style={{color: "#4ade80"}}>{type === "group" ? "GROUP TRIP" : "EVENT"}</span></h2>
      <form onSubmit={handleSubmit} style={{display: "grid", gap: "20px"}}>
        <input required placeholder="Full Name" style={inputStyle} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
        <input required type="email" placeholder="Email" style={inputStyle} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
          <select style={inputStyle} value={form.occasion} onChange={e => setForm({...form, occasion: e.target.value})}>
            <option>Wedding</option><option>Birthday</option><option>Corporate</option><option>Other</option>
          </select>
          <input type="number" placeholder="Group Size" style={inputStyle} value={form.groupSize} onChange={e => setForm({...form, groupSize: parseInt(e.target.value) || ""})} />
        </div>
        <input placeholder="Destination" style={inputStyle} value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
        <textarea placeholder="Notes / Dates" style={{...inputStyle, minHeight: "100px"}} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
        <button type="submit" disabled={loading} style={btnStyle}>{loading ? "SENDING..." : "SUBMIT REQUEST"}</button>
        {status && <p style={{textAlign: "center", color: status.includes("Success") ? "#4ade80" : "#f87171"}}>{status}</p>}
      </form>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "16px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white", boxSizing: "border-box" };
const btnStyle = { padding: "18px", background: "#4ade80", color: "#0f172a", border: "none", borderRadius: "12px", fontWeight: "900", cursor: "pointer" };