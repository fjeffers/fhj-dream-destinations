// netlify/functions/admin-concierge-get.js
// Simple GET endpoint for admin concierge list (used by AdminConcierge.jsx)
const { supabase, respond } = require('./utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(204, {});
  if (event.httpMethod !== 'GET') return respond(405, { error: 'GET only' });

  try {
    const { data, error } = await supabase
      .from('concierge')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    // If ordering by created_at fails (column may not exist), retry without ordering
    if (error) {
      const { data: d2, error: e2 } = await supabase
        .from('concierge')
        .select('*')
        .limit(200);
      if (e2) throw e2;
      return respond(200, { data: d2 || [] });
    }

    return respond(200, { data: data || [] });
  } catch (err) {
    console.error('admin-concierge-get error:', err);
    return respond(500, { error: err.message || String(err) });
  }
};

