// ==========================================================
// 📄 FILE: ConciergeChat.jsx  (BUILD OUT)
// Floating concierge chat with real backend integration
// Location: src/components/concierge/ConciergeChat.jsx
// ==========================================================

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fhjTheme } from "../FHJ/FHJUIKit.jsx";
import ConciergeToggleButton from "./ConciergeToggleButton.jsx";

const placeholders = {
  name: "Your name…",
  email: "Your email address…",
  phone: "Your phone number…",
  message: "Tell us about your dream trip…",
};

export default function ConciergeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("name");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      from: "concierge",
      text: "Welcome to FHJ Dream Destinations! How can we help make your travel dreams a reality? ✈️ First, what's your name?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    // Add user message
    const userMsg = { id: `user-${Date.now()}`, from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (step === "name") {
      setUserName(trimmed);
      setStep("email");
      const reply = {
        id: `concierge-${Date.now()}`,
        from: "concierge",
        text: `Nice to meet you, ${trimmed}! What's your email address so we can follow up with you?`,
      };
      setTimeout(() => setMessages((prev) => [...prev, reply]), 400);
      return;
    }

    if (step === "email") {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (!emailValid) {
        const errReply = {
          id: `concierge-${Date.now()}`,
          from: "concierge",
          text: "That doesn't look like a valid email address. Please try again.",
        };
        setTimeout(() => setMessages((prev) => [...prev, errReply]), 400);
        return;
      }
      setUserEmail(trimmed);
      setStep("phone");
      const reply = {
        id: `concierge-${Date.now()}`,
        from: "concierge",
        text: "Great! What's the best phone number to reach you?",
      };
      setTimeout(() => setMessages((prev) => [...prev, reply]), 400);
      return;
    }

    if (step === "phone") {
      setUserPhone(trimmed);
      setStep("message");
      const reply = {
        id: `concierge-${Date.now()}`,
        from: "concierge",
        text: "Perfect! What can we help you with today? Tell us about your dream destination or any questions you have.",
      };
      setTimeout(() => setMessages((prev) => [...prev, reply]), 400);
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
        const reply = {
          id: `concierge-${Date.now()}`,
          from: "concierge",
          text: `Thank you, ${userName}! 🌴 Your message has been received and we'll reach out to you at ${userEmail} shortly. We look forward to crafting your perfect journey!`,
        };
        setTimeout(() => setMessages((prev) => [...prev, reply]), 600);
      } else {
        const errReply = {
          id: `err-${Date.now()}`,
          from: "concierge",
          text: "I'm sorry, something went wrong. Please try again or reach out to us directly at info@fhjdreamdestinations.com",
        };
        setTimeout(() => setMessages((prev) => [...prev, errReply]), 400);
      }
    } catch (err) {
      const errReply = {
        id: `err-${Date.now()}`,
        from: "concierge",
        text: "I'm sorry, something went wrong. Please try again or reach out to us directly at info@fhjdreamdestinations.com",
      };
      setTimeout(() => setMessages((prev) => [...prev, errReply]), 400);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
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
              <div>
                <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem" }}>FHJ Concierge</h3>
                <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                  Ask about events, travel, or your itinerary.
                </p>
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

              {sending && (
                <div style={{ ...messageBubble, ...conciergeBubble, opacity: 0.6 }}>
                  <p style={{ margin: 0 }}>Sending...</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {step !== "done" && (
              <form onSubmit={handleSubmit} style={inputRowStyle}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholders[step] || "…"}
                  disabled={sending}
                  style={inputFieldStyle}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  style={{
                    ...sendBtnStyle,
                    opacity: sending || !input.trim() ? 0.4 : 1,
                  }}
                >
                  Send
                </button>
              </form>
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
  maxHeight: "520px",
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
  minHeight: "250px",
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