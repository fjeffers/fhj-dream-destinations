// ==========================================================
// 📄 FILE: upload-image.js — Supabase Storage image upload
// Accepts multipart/form-data with: file, fileName, bucket
// Returns { url } — the public URL of the uploaded image.
// Called by: EventImageUpload.jsx
// Location: netlify/functions/upload-image.js
// ==========================================================

const { supabase, respond } = require("./utils");

// Parse a multipart/form-data body from a Netlify function event.
// Returns { fields: {}, files: [{ filename, contentType, data: Buffer }] }
function parseMultipart(event) {
  const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
  const boundaryMatch = contentType.match(/boundary=(.+)$/i);
  if (!boundaryMatch) throw new Error("No multipart boundary found");

  const boundary = boundaryMatch[1].trim();
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : Buffer.from(event.body, "binary");

  const parts = [];
  const sep = Buffer.from(`--${boundary}`);
  let start = 0;

  while (start < body.length) {
    const sepIdx = body.indexOf(sep, start);
    if (sepIdx === -1) break;
    const headerStart = sepIdx + sep.length + 2; // skip \r\n
    const headerEnd = body.indexOf(Buffer.from("\r\n\r\n"), headerStart);
    if (headerEnd === -1) break;

    const headers = body.slice(headerStart, headerEnd).toString("utf8");
    const contentStart = headerEnd + 4;
    const nextSep = body.indexOf(sep, contentStart);
    const contentEnd = nextSep === -1 ? body.length : nextSep - 2; // trim \r\n

    const data = body.slice(contentStart, contentEnd);

    const nameMatch = headers.match(/name="([^"]+)"/i);
    const filenameMatch = headers.match(/filename="([^"]+)"/i);
    const ctMatch = headers.match(/Content-Type:\s*(.+)/i);

    if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        filename: filenameMatch ? filenameMatch[1] : null,
        contentType: ctMatch ? ctMatch[1].trim() : "application/octet-stream",
        data,
      });
    }

    start = nextSep === -1 ? body.length : nextSep;
  }

  const fields = {};
  const files = [];
  for (const part of parts) {
    if (part.filename) {
      files.push(part);
    } else {
      fields[part.name] = part.data.toString("utf8");
    }
  }

  return { fields, files };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  try {
    const { fields, files } = parseMultipart(event);

    const filePart = files[0];
    if (!filePart) return respond(400, { error: "No file provided" });

    // Validate file extension against allowed image formats
    const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif"]);
    const rawExt = (filePart.filename || "file").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return respond(400, { error: `File type .${rawExt} is not allowed. Permitted formats: jpg, jpeg, png, gif, webp, avif` });
    }

    const bucket = fields.bucket || "event-images";
    const fileName = fields.fileName
      ? fields.fileName.replace(/[^a-zA-Z0-9._-]/g, "_") // sanitise caller-supplied name
      : `${Date.now()}-upload.${rawExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, filePart.data, {
        contentType: filePart.contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError.message);
      return respond(500, { error: uploadError.message });
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const url = publicData?.publicUrl || "";

    return respond(200, { url, fileName });
  } catch (err) {
    console.error("upload-image error:", err.message);
    return respond(500, { error: err.message });
  }
};
