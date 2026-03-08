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
  conversation: "Reply to your concierge…",
};

export default function ConciergeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("name");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [conciergeId, setConciergeId] = useState(null);
  const [typing, setTyping] = useState(false);
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
  }, [messages, typing]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleEndChat = () => {
    setStep("done");
    setTyping(false);
    setMessages((prev) => [...prev, {
      id: `concierge-bye-${Date.now()}`,
      from: "concierge",
      text: `It was wonderful chatting with you, ${userName}! Our travel team will review everything and reach out to you at ${userEmail} shortly. We can't wait to help you plan your dream trip! ✈️🌍`,
    }]);
  };

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

    // step === "conversation" — follow-up message
    if (step === "conversation") {
      setSending(true);
      setTyping(true);

      try {
        const res = await fetch("/.netlify/functions/concierge-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concierge_id: conciergeId,
            message: trimmed,
          }),
        });

        const data = await res.json();
        if (data.reply) {
          setTimeout(() => {
            setTyping(false);
            setMessages((prev) => [...prev, {
              id: `ai-reply-${Date.now()}`,
              from: "concierge",
              text: data.reply,
            }]);
          }, 500);
        } else {
          setTyping(false);
        }
      } catch (err) {
        setTyping(false);
        setMessages((prev) => [...prev, {
          id: `err-${Date.now()}`,
          from: "concierge",
          text: "I'm sorry, something went wrong. Please try again or reach out to us directly at info@fhjdreamdestinations.com",
        }]);
      } finally {
        setSending(false);
      }
      return;
    }

    // step === "message" — initial submit
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
        setConciergeId(data.conciergeId);

        // Show thank you message
        const thankYou = {
          id: `concierge-thanks-${Date.now()}`,
          from: "concierge",
          text: `Thank you, ${userName}! 🌴 Your message has been received. Let me ask a few quick questions to help our team plan your perfect trip:`,
        };
        setMessages((prev) => [...prev, thankYou]);

        // Show AI suggestions as individual bubbles with staggered timing
        if (data.suggestions && data.suggestions.length > 0) {
          setStep("conversation");
          setTyping(true);
          data.suggestions.forEach((suggestion, i) => {
            setTimeout(() => {
              setMessages((prev) => [...prev, {
                id: `ai-suggestion-${Date.now()}-${i}`,
                from: "concierge",
                text: suggestion,
              }]);
              if (i === data.suggestions.length - 1) {
                setTyping(false);
              }
            }, 800 + (i * 600));
          });
        } else {
          // No suggestions — keep chat open for follow-up
          setStep("conversation");
          setTimeout(() => {
            setMessages((prev) => [...prev, {
              id: `concierge-followup-${Date.now()}`,
              from: "concierge",
              text: "What destinations are you dreaming about? Any specific dates or occasions?",
            }]);
          }, 800);
        }
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
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dots span {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 2px;
          border-radius: 50%;
          background: #94a3b8;
          animation: typingBounce 1.2s ease-in-out infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
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

              {typing && (
                <div style={{ ...messageBubble, ...conciergeBubble, opacity: 0.6 }}>
                  <p style={{ margin: 0 }}>
                    <span className="typing-dots">
                      <span></span><span></span><span></span>
                    </span>
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* End Chat button */}
            {step === "conversation" && (
              <div style={{ padding: "0 1rem 0.5rem", display: "flex", justifyContent: "center" }}>
                <button onClick={handleEndChat} style={endChatBtnStyle}>
                  ✓ I'm all set, thank you!
                </button>
              </div>
            )}

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

const endChatBtnStyle = {
  padding: "0.45rem 1rem",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#94a3b8",
  fontSize: "0.78rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};