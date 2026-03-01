// ==========================================================
// 📄 FILE: ConciergeChat.jsx  (INTERACTIVE UPGRADE)
// Floating concierge chat with typing indicator, quick-reply
// chips, session persistence, and reset support.
// Location: src/components/concierge/ConciergeChat.jsx
// ==========================================================

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fhjTheme } from "../FHJ/FHJUIKit.jsx";
import ConciergeToggleButton from "./ConciergeToggleButton.jsx";

const SESSION_KEY = "fhj_chat_state";

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    from: "concierge",
    text: "Welcome to FHJ Dream Destinations! How can we help make your travel dreams a reality? ✈️ First, what's your name?",
  },
];

const placeholders = {
  name: "Your name…",
  email: "Your email address…",
  phone: "Your phone number…",
  message: "Tell us about your dream trip…",
};

// Quick-reply suggestions shown at the message step
const QUICK_REPLIES = [
  "Plan a vacation ✈️",
  "Custom itinerary 🗺️",
  "Question about an event 🎉",
  "Group travel 👥",
];

export default function ConciergeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("name");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimersRef = useRef([]);   // track pending timers so we can cancel on reset
  const msgCounterRef = useRef(0);      // collision-safe message IDs

  // ── Restore session on mount ──────────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { messages: m, step: s, userName: n, userEmail: e, userPhone: p } = JSON.parse(saved);
        if (m?.length) setMessages(m);
        if (s) setStep(s);
        if (n) setUserName(n);
        if (e) setUserEmail(e);
        if (p) setUserPhone(p);
      }
    } catch {
      // sessionStorage may be unavailable (e.g. private browsing) — safe to ignore
    }
  }, []);

  // ── Persist session on state change ──────────────────────
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ messages, step, userName, userEmail, userPhone })
      );
    } catch {
      // sessionStorage may be unavailable — safe to ignore
    }
  }, [messages, step, userName, userEmail, userPhone]);

  // ── Auto-scroll on new message ────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Helper: show typing → then add concierge message ─────
  // Tracks timers so handleReset can cancel any in-flight replies.
  const conciergeSay = (text, delay = 350) => {
    const t1 = setTimeout(() => {
      setIsTyping(true);
      const t2 = setTimeout(() => {
        setIsTyping(false);
        msgCounterRef.current += 1;
        setMessages((prev) => [
          ...prev,
          { id: `c-${msgCounterRef.current}`, from: "concierge", text },
        ]);
      }, 900);
      typingTimersRef.current.push(t2);
    }, delay);
    typingTimersRef.current.push(t1);
  };

  // ── Reset to fresh conversation ───────────────────────────
  const handleReset = () => {
    // Cancel any in-flight typing timers before resetting state
    typingTimersRef.current.forEach(clearTimeout);
    typingTimersRef.current = [];
    try { sessionStorage.removeItem(SESSION_KEY); } catch {
      // sessionStorage may be unavailable — safe to ignore
    }
    setStep("name");
    setUserName("");
    setUserEmail("");
    setUserPhone("");
    setMessages(INITIAL_MESSAGES);
    setInput("");
  };

  const handleToggle = () => setIsOpen((o) => !o);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, from: "user", text: trimmed },
    ]);
    setInput("");

    if (step === "name") {
      setUserName(trimmed);
      setStep("email");
      conciergeSay(`Nice to meet you, ${trimmed}! What's your email address so we can follow up with you?`);
      return;
    }

    if (step === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        conciergeSay("That doesn't look like a valid email address. Please try again.");
        return;
      }
      setUserEmail(trimmed);
      setStep("phone");
      conciergeSay("Great! What's the best phone number to reach you?");
      return;
    }

    if (step === "phone") {
      setUserPhone(trimmed);
      setStep("message");
      conciergeSay("Perfect! What can we help you with today? Tell us about your dream destination or any questions you have.");
      return;
    }

    // step === "message"
    setSending(true);
    try {
      const res = await fetch("/.netlify/functions/concierge-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          phone: userPhone,
          message: trimmed,
          source: "Chat Widget",
          context: "Concierge Chat Widget",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("done");
        conciergeSay(
          `Thank you, ${userName}! 🌴 Your message has been received and we'll reach out to you at ${userEmail} shortly. We look forward to crafting your perfect journey!`,
          200
        );
      } else {
        conciergeSay("I'm sorry, something went wrong. Please try again or reach out to us directly at info@fhjdreamdestinations.com");
      }
    } catch {
      conciergeSay("I'm sorry, something went wrong. Please try again or reach out to us directly at info@fhjdreamdestinations.com");
    } finally {
      setSending(false);
    }
  };

  // Fill input from a quick-reply chip
  const handleQuickReply = (text) => {
    setInput(text);
  };

  return (
    <>
      {/* Keyframes for the typing dots */}
      <style>{`
        @keyframes fhj-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fhj-online-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <ConciergeToggleButton isOpen={isOpen} onToggle={handleToggle} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            style={panelStyle}
          >
            {/* Header */}
            <div style={headerStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {/* Pulsing online dot */}
                <span style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#00c48c",
                  animation: "fhj-online-pulse 2s ease-in-out infinite",
                  flexShrink: 0,
                }} />
                <div>
                  <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem" }}>FHJ Concierge</h3>
                  <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                    Ask about events, travel, or your itinerary.
                  </p>
                </div>
              </div>
              <button onClick={handleToggle} style={closeBtnStyle} aria-label="Close chat">✕</button>
            </div>

            {/* Messages */}
            <div style={messagesStyle}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...messageBubble,
                    ...(msg.from === "user" ? userBubble : conciergeBubble),
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ ...messageBubble, ...conciergeBubble, padding: "0.65rem 1rem" }}>
                  <span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{
                        display: "inline-block",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#94a3b8",
                        animation: `fhj-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick-reply chips (only at message step, when input is empty) */}
            {step === "message" && !input && !isTyping && (
              <div style={quickRepliesContainerStyle}>
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleQuickReply(qr)}
                    style={quickReplyChipStyle}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            {step !== "done" && (
              <form onSubmit={handleSubmit} style={inputRowStyle}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholders[step] || "…"}
                  disabled={sending || isTyping}
                  style={inputFieldStyle}
                />
                <button
                  type="submit"
                  disabled={sending || isTyping || !input.trim()}
                  style={{
                    ...sendBtnStyle,
                    opacity: sending || isTyping || !input.trim() ? 0.4 : 1,
                  }}
                >
                  {sending ? "…" : "Send"}
                </button>
              </form>
            )}

            {/* Done state: offer to start a new conversation */}
            {step === "done" && !isTyping && (
              <div style={doneFooterStyle}>
                <button onClick={handleReset} style={resetBtnStyle}>
                  Start a new conversation
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const panelStyle = {
  position: "fixed",
  bottom: "90px",
  right: "20px",
  width: "380px",
  maxHeight: "560px",
  background: "rgba(10, 10, 20, 0.96)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  zIndex: 9998,
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "1.25rem 1.25rem 1rem",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.5)",
  fontSize: "1rem",
  cursor: "pointer",
  padding: "4px",
};

const messagesStyle = {
  flex: 1,
  padding: "1rem 1.25rem",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  minHeight: "200px",
};

const messageBubble = {
  maxWidth: "85%",
  padding: "0.75rem 1rem",
  borderRadius: "14px",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const userBubble = {
  alignSelf: "flex-end",
  background: "rgba(0,196,140,0.2)",
  color: "#d1fae5",
  borderBottomRightRadius: "4px",
};

const conciergeBubble = {
  alignSelf: "flex-start",
  background: "rgba(255,255,255,0.08)",
  color: "#e5e7eb",
  borderBottomLeftRadius: "4px",
};

const quickRepliesContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  padding: "0.5rem 1.25rem 0.6rem",
};

const quickReplyChipStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "999px",
  background: "rgba(0,196,140,0.1)",
  border: "1px solid rgba(0,196,140,0.3)",
  color: "#6ee7b7",
  fontSize: "0.78rem",
  cursor: "pointer",
  transition: "background 0.15s ease",
  whiteSpace: "nowrap",
};

const inputRowStyle = {
  display: "flex",
  gap: "0.5rem",
  padding: "0.75rem 1rem",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const inputFieldStyle = {
  flex: 1,
  padding: "0.6rem 0.85rem",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  fontSize: "0.85rem",
  outline: "none",
};

const sendBtnStyle = {
  padding: "0.6rem 1.25rem",
  borderRadius: "999px",
  background: "rgba(0,196,140,0.2)",
  border: "1px solid rgba(0,196,140,0.4)",
  color: "#00c48c",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const doneFooterStyle = {
  padding: "0.75rem 1.25rem",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "center",
};

const resetBtnStyle = {
  background: "none",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "999px",
  color: "#94a3b8",
  fontSize: "0.8rem",
  padding: "0.4rem 1rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};