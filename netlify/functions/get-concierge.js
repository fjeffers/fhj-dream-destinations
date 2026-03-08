// netlify/functions/get-concierge.js
// Public create & GET for concierge (website form).
// On POST: creates parent concierge row, persists initial client message,
// generates AI clarifying questions (persisted), emails owner via Resend, and archives the conversation.

const { supabase, respond } = require('./utils');

const AI_SUGGEST_PATH = '/.netlify/functions/ai-suggest';
const EMAIL_SUMMARY_PATH = '/.netlify/functions/email-summary';

function safeParse(body) {
  try { return body ? JSON.parse(body) : {}; } catch (e) { return null; }
}

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(204, {});
  if (!supabase) return respond(500, { error: 'Supabase client not configured' });

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase.from('concierge').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return respond(200, { success: true, concierge: data || [] });
    }

    if (event.httpMethod === 'POST') {
      const body = safeParse(event.body);
      if (body === null) return respond(400, { error: 'Invalid JSON' });

      // Basic payload (guaranteed columns)
      const basicPayload = {
        name: body.name || '',
        email: body.email || '',
        message: body.message || '',
        source: body.source || 'Website',
      };

      // Optional columns (may not exist yet)
      const optionalPayload = {
        phone: body.phone || '',
        status: 'New',
        conversation_open: true,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };

      // Try with all fields, fall back to basic
      let parent, pErr;
      ({ data: parent, error: pErr } = await supabase.from('concierge').insert([{ ...basicPayload, ...optionalPayload }]).select().single());
      if (pErr) {
        console.warn('Insert with optional fields failed, retrying basic:', pErr.message);
        ({ data: parent, error: pErr } = await supabase.from('concierge').insert([basicPayload]).select().single());
        if (pErr) throw pErr;
      }

      const cid = parent.id;

      // Insert initial client message (without created_at — let DB default handle it)
      try {
        await supabase.from('concierge_messages').insert([{
          concierge_id: cid,
          sender: 'client',
          body: basicPayload.message,
          metadata: { source: basicPayload.source },
        }]);
      } catch (e) {
        console.error('Failed to insert initial message:', e);
      }

      // Generate AI clarifying questions server-side by calling ai-suggest function internally
      const siteOrigin = process.env.SITE_ORIGIN || process.env.URL || '';
      let suggestions = [];
      try {
        if (siteOrigin) {
          const aiUrl = siteOrigin.replace(/\/$/, '') + AI_SUGGEST_PATH;
          const aiRes = await fetch(aiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: basicPayload.message, context: basicPayload.source, persist: true, concierge_id: cid })
          });
          const aiJson = await aiRes.json();
          suggestions = aiJson?.suggestions || [];
        }
      } catch (e) {
        console.error('ai-suggest call failed', e);
      }

      // After AI messages persisted, send email summary via email-summary function
      try {
        if (siteOrigin) {
          const emailUrl = siteOrigin.replace(/\/$/, '') + EMAIL_SUMMARY_PATH;
          await fetch(emailUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concierge_id: cid })
          });
        }

        // Try to auto-archive (optional columns may not exist)
        try {
          await supabase.from('concierge').update({ status: 'Archived', conversation_open: false, last_activity: new Date().toISOString() }).eq('id', cid);
        } catch (e) { console.warn('Auto-archive update failed (optional columns may not exist):', e.message); }
      } catch (e) {
        console.error('email-summary call failed', e);
      }

      return respond(200, { success: true, record: parent, suggestions });
    }

    return respond(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('get-concierge error', err);
    return respond(500, { error: err.message || String(err) });
  }
};

