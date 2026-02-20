// ==========================================================
// 📄 FILE: EventQRCode.jsx
// Generate printable QR code for event RSVP link
// Location: src/components/admin/events/EventQRCode.jsx
// ==========================================================

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { FHJButton, fhjTheme } from "../../FHJ/FHJUIKit.jsx";

export default function EventQRCode({ eventId, eventName, onClose }) {
  const [qrCode, setQrCode] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    generateQR();
  }, [eventId]);

  const generateQR = async () => {
    const rsvpLink = `${window.location.origin}/rsvp/${eventId}`;
    
    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(rsvpLink, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      
      setQrCode(qrDataUrl);
      
      // Also render to canvas for high-res export
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, rsvpLink, {
          width: 600,
          margin: 3,
        });
      }
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.download = `${eventName.replace(/\s+/g, "-")}-RSVP-QR.png`;
    link.href = qrCode;
    link.click();
  };

  const printQR = () => {
    const rsvpLink = `${window.location.origin}/rsvp/${eventId}`;
    
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>RSVP QR Code - ${eventName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 40px;
            text-align: center;
          }
          h1 {
            color: #0f172a;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #64748b;
            font-size: 18px;
            margin-bottom: 30px;
          }
          .qr-container {
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin-bottom: 30px;
          }
          img {
            width: 400px;
            height: 400px;
          }
          .link {
            font-size: 14px;
            color: #64748b;
            word-break: break-all;
            max-width: 500px;
            margin: 20px auto;
          }
          .instructions {
            font-size: 16px;
            color: #475569;
            max-width: 600px;
            line-height: 1.6;
          }
          @media print {
            body {
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>${eventName}</h1>
        <div class="subtitle">Scan to RSVP</div>
        
        <div class="qr-container">
          <img src="${qrCode}" alt="RSVP QR Code" />
        </div>
        
        <div class="link">
          ${rsvpLink}
        </div>
        
        <div class="instructions">
          <strong>How to use this QR code:</strong><br/>
          • Print this page and include in physical invitations<br/>
          • Display at your event location<br/>
          • Share digitally in emails or social media<br/>
          • Guests scan with phone camera to RSVP instantly
        </div>
        
        <div class="no-print" style="margin-top: 30px;">
          <button onclick="window.print()" style="
            background: #4ade80;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Print QR Code</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const copyLink = () => {
    const rsvpLink = `${window.location.origin}/rsvp/${eventId}`;
    navigator.clipboard.writeText(rsvpLink);
    alert("RSVP link copied to clipboard!");
  };

  const shareViaEmail = () => {
    const rsvpLink = `${window.location.origin}/rsvp/${eventId}`;
    const subject = encodeURIComponent(`RSVP for ${eventName}`);
    const body = encodeURIComponent(
      `You're invited to ${eventName}!\n\nPlease RSVP using this link:\n${rsvpLink}\n\nLooking forward to seeing you there!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ color: fhjTheme.colors.accent, margin: 0 }}>Event QR Code</h2>
            <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.25rem" }}>{eventName}</div>
          </div>
          <button onClick={onClose} style={closeButton}>
            ✕
          </button>
        </div>

        {/* QR Code Display */}
        <div style={qrDisplay}>
          {qrCode ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Scan to RSVP
                </div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Share this QR code with your guests
                </div>
              </div>
              
              <div style={qrCodeContainer}>
                <img src={qrCode} alt="RSVP QR Code" style={{ width: "100%", height: "auto" }} />
              </div>

              {/* Hidden high-res canvas for download */}
              <canvas ref={canvasRef} style={{ display: "none" }} />

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", wordBreak: "break-all" }}>
                  {window.location.origin}/rsvp/{eventId}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
              Generating QR code...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1.5rem" }}>
          <FHJButton onClick={printQR} disabled={!qrCode}>
            🖨️ Print QR Code
          </FHJButton>
          <FHJButton onClick={downloadQR} disabled={!qrCode}>
            💾 Download PNG
          </FHJButton>
          <FHJButton onClick={copyLink} disabled={!qrCode}>
            📋 Copy Link
          </FHJButton>
          <FHJButton onClick={shareViaEmail} disabled={!qrCode}>
            📧 Share via Email
          </FHJButton>
        </div>

        {/* Instructions */}
        <div style={instructionsBox}>
          <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>📱 How to use:</div>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.85rem", lineHeight: 1.6 }}>
            <li>Print and include in physical invitations</li>
            <li>Display at event location for last-minute RSVPs</li>
            <li>Share in emails, texts, or social media</li>
            <li>Guests scan with phone camera to RSVP instantly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Styles
const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  padding: "2rem",
};

const modal = {
  width: "100%",
  maxWidth: "500px",
  background: "rgba(10,10,20,0.98)",
  borderRadius: "16px",
  padding: "2rem",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
};

const closeButton = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  fontSize: "1.5rem",
  cursor: "pointer",
  padding: "0.25rem 0.5rem",
  borderRadius: "4px",
};

const qrDisplay = {
  background: "rgba(20,30,48,0.5)",
  borderRadius: "12px",
  padding: "1.5rem",
};

const qrCodeContainer = {
  background: "white",
  padding: "1.5rem",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  maxWidth: "350px",
  margin: "0 auto",
};

const instructionsBox = {
  marginTop: "1.5rem",
  padding: "1rem",
  background: "rgba(74,222,128,0.1)",
  border: "1px solid rgba(74,222,128,0.2)",
  borderRadius: "8px",
  color: "#e2e8f0",
  fontSize: "0.9rem",
};