// ==========================================================
// FILE: utils.js — Supabase Edition
// Replaces Airtable utils.js with Supabase equivalents
// Location: netlify/functions/utils.js
// ==========================================================

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ==========================================================
// Table name mapping: Airtable names → Supabase table names
// This lets existing functions keep using Airtable-style names
// ==========================================================
const TABLE_MAP = {
  "Trips": "trips",
  "Client Name": "clients",
  "Deals": "deals",
  "Events": "events",
  "RSVPs": "rsvps",
  "BlockedSlots": "blocked_slots",
  "Concierge": "concierge",
  "Documents": "documents",
  "Payments": "payments",
  "Bookings": "bookings",
  "Admins": "admins",
  "AuditLog": "audit_log",
  "Client Login": "client_login",
};

function resolveTable(name) {
  return TABLE_MAP[name] || name.toLowerCase().replace(/\s+/g, "_");
}

// ==========================================================
// Field name mapping: Airtable field names → Supabase columns
// ==========================================================
const FIELD_MAP = {
  // Trips
  "Client": "client",
  "client_email": "client_email",
  "Phone": "phone",
  "Start Date": "start_date",
  "End Date": "end_date",
  "Consultation Date": "consultation_date",
  "Consultation Time": "consultation_time",
  "Destination": "destination",
  "Trip Type": "trip_type",
  "Status": "status",
  "Occasion": "occasion",
  "Flexible Dates": "flexible_dates",
  "Group Size": "group_size",
  "Budget Range": "budget_range",
  "Notes": "notes",
  "Note": "notes",
  // Clients
  "Full Name": "full_name",
  "Email": "email",
  "Address": "address",
  // Deals
  "Trip Name": "trip_name",
  "Category": "category",
  "Price": "price",
  "Place Image URL": "place_image_url",
  "Active": "active",
  // Events
  "Title": "title",
  "Slug": "slug",
  "Date": "date",
  "Time": "time",
  "Location": "location",
  "HostName": "host_name",
  "Description": "description",
  "Background": "background",
  "EventPic": "event_pic",
  "ClientPic": "client_pic",
  "Share Link": "share_link",
  "QR Code": "qr_code",
  // RSVPs
  "Guests": "guests",
  "Message": "message",
  // Blocked Slots
  "All Day": "all_day",
  "Reason": "reason",
  // Concierge
  "Name": "name",
  "Source": "source",
  "Context": "context",
  "Reply": "reply",
};

function mapFieldsToColumns(fields) {
  const mapped = {};
  for (const [key, value] of Object.entries(fields)) {
    const col = FIELD_MAP[key] || key.toLowerCase().replace(/\s+/g, "_");
    mapped[col] = value;
  }
  return mapped;
}

function mapColumnsToFields(row) {
  // Reverse: return the row as-is but also add Airtable-style field names
  // This ensures both camelCase and Airtable-style access work
  if (!row) return null;
  const result = { ...row };
  // Add common Airtable-style aliases
  if (row.full_name) result["Full Name"] = row.full_name;
  if (row.client_email) result["client_email"] = row.client_email;
  if (row.start_date) result["Start Date"] = row.start_date;
  if (row.end_date) result["End Date"] = row.end_date;
  if (row.consultation_date) result["Consultation Date"] = row.consultation_date;
  if (row.consultation_time) result["Consultation Time"] = row.consultation_time;
  if (row.trip_type) result["Trip Type"] = row.trip_type;
  if (row.group_size) result["Group Size"] = row.group_size;
  if (row.budget_range) result["Budget Range"] = row.budget_range;
  if (row.flexible_dates !== undefined) result["Flexible Dates"] = row.flexible_dates;
  if (row.trip_name) result["Trip Name"] = row.trip_name;
  if (row.place_image_url) result["Place Image URL"] = row.place_image_url;
  if (row.all_day !== undefined) result["All Day"] = row.all_day;
  if (row.host_name) result["HostName"] = row.host_name;
  if (row.event_pic) result["EventPic"] = row.event_pic;
  if (row.client_pic) result["ClientPic"] = row.client_pic;
  if (row.share_link) result["Share Link"] = row.share_link;
  if (row.qr_code) result["QR Code"] = row.qr_code;
  // Keep created_at as createdTime for compatibility
  if (row.created_at) result.createdTime = row.created_at;
  return result;
}

// ==========================================================
// Core CRUD functions (drop-in replacements for Airtable ones)
// ==========================================================

/**
 * Select records from a table
 * @param {string} tableName - Airtable-style table name (e.g., "Trips", "Client Name")
 * @param {string|null} filter - Airtable filter formula string OR null for all records
 * @param {object} options - { normalizer: function|true }
 */
async function selectRecords(tableName, filter, options = {}) {
  const table = resolveTable(tableName);
  let query = supabase.from(table).select("*");

  // Parse simple Airtable filter formulas
  if (filter && typeof filter === "string" && filter.trim()) {
    const parsed = parseAirtableFilter(filter);
    if (parsed) {
      query = query.eq(parsed.column, parsed.value);
    }
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error(`selectRecords(${table}) error:`, error.message);
    throw new Error(error.message);
  }

  let records = (data || []).map(mapColumnsToFields);

  // Apply normalizer if provided
  if (options.normalizer && typeof options.normalizer === "function") {
    records = records.map(options.normalizer).filter(Boolean);
  }

  return records;
}

/**
 * Parse simple Airtable filter formulas like: {Email} = 'test@test.com'
 */
function parseAirtableFilter(formula) {
  // Match: {FieldName} = 'value' or LOWER({FieldName})='value'
  const match = formula.match(/(?:LOWER\()?\{([^}]+)\}(?:\))?\s*=\s*'([^']*)'/i);
  if (match) {
    const field = match[1];
    const value = match[2];
    const col = FIELD_MAP[field] || field.toLowerCase().replace(/\s+/g, "_");
    return { column: col, value };
  }
  return null;
}

/**
 * Insert a record into a table
 */
async function submitToAirtable(tableName, fields) {
  const table = resolveTable(tableName);
  const mapped = mapFieldsToColumns(fields);

  const { data, error } = await supabase
    .from(table)
    .insert([mapped])
    .select()
    .single();

  if (error) {
    console.error(`submitToAirtable(${table}) error:`, error.message);
    throw new Error(error.message);
  }

  return mapColumnsToFields(data);
}

/**
 * Update a record by ID
 */
async function updateAirtableRecord(tableName, id, fields) {
  const table = resolveTable(tableName);
  const mapped = mapFieldsToColumns(fields);

  const { data, error } = await supabase
    .from(table)
    .update(mapped)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`updateAirtableRecord(${table}, ${id}) error:`, error.message);
    throw new Error(error.message);
  }

  return mapColumnsToFields(data);
}

/**
 * Delete a record by ID
 */
async function deleteAirtableRecord(tableName, id) {
  const table = resolveTable(tableName);

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`deleteAirtableRecord(${table}, ${id}) error:`, error.message);
    throw new Error(error.message);
  }

  return { success: true };
}

// ==========================================================
// HTTP Response helper
// ==========================================================
function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

// ==========================================================
// Trip Normalizer (same interface as before)
// ==========================================================
function normalizeTrip(record) {
  if (!record) return null;
  return {
    id: record.id,
    destination: record.destination || "",
    phone: record.phone || "",
    address: record.address || "",
    client: record.client || null,
    clientEmail: record.client_email || "",
    startDate: record.start_date || "",
    endDate: record.end_date || "",
    tripType: record.trip_type || "",
    flexibleDates: !!record.flexible_dates,
    groupSize: record.group_size ?? null,
    occasion: record.occasion || "",
    status: record.status || "",
    budgetRange: record.budget_range || "",
    notes: record.notes || "",
    consultationTime: record.consultation_time || "",
    consultationDate: record.consultation_date || "",
    createdTime: record.created_at,
  };
}

// ==========================================================
// Client Normalizer
// ==========================================================
function normalizeClient(record) {
  if (!record) return null;
  return {
    id: record.id,
    fullName: record.full_name || "",
    email: record.email || "",
    phone: record.phone || "",
    address: record.address || "",
    trips: record.trips || [],
    createdTime: record.created_at,
  };
}

// ==========================================================
// Supabase client export (for functions that need direct access)
// ==========================================================

module.exports = {
  supabase,
  selectRecords,
  submitToAirtable,
  updateAirtableRecord,
  deleteAirtableRecord,
  respond,
  normalizeTrip,
  normalizeClient,
  resolveTable,
  mapFieldsToColumns,
};