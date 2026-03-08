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

      const payload = {
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        message: body.message || '',
        source: body.source || 'Website',
        status: 'New',
        conversation_open: true,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };

      // Insert parent row
      const { data: parent, error: pErr } = await supabase.from('concierge').insert([payload]).select().single();
      if (pErr) throw pErr;

      const cid = parent.id;

      // Insert initial client message into concierge_messages
      const insertMsg = {
        concierge_id: cid,
        sender: 'client',
        body: payload.message,
        metadata: { source: payload.source },
        created_at: new Date().toISOString()
      };
      await supabase.from('concierge_messages').insert([insertMsg]);

      // Generate AI clarifying questions server-side by calling ai-suggest function internally
      // (call via relative function endpoint so the OpenAI logic is centralized)
      const siteOrigin = process.env.SITE_ORIGIN || process.env.URL || '';
      const aiUrl = (siteOrigin ? siteOrigin.replace(/\/$/, '') : '') + AI_SUGGEST_PATH;
      let suggestions = [];
      try {
        // Prefer server-side internal call; if SITE_ORIGIN missing, call OpenAI directly here
        if (siteOrigin) {
          const aiRes = await fetch(aiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: payload.message, context: payload.source, persist: true, concierge_id: cid })
          });
          const aiJson = await aiRes.json();
          suggestions = aiJson?.suggestions || [];
        } else {
          // fallback: try direct OpenAI call via local ai-suggest import pattern by invoking the function file
          // Attempt a POST to /.netlify/functions/ai-suggest with relative path (Netlify dev should handle)
          const aiRes = await fetch(`http://localhost:8888${AI_SUGGEST_PATH}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: payload.message, context: payload.source, persist: true, concierge_id: cid })
          });
          const aiJson = await aiRes.json();
          suggestions = aiJson?.suggestions || [];
        }
      } catch (e) {
        console.error('ai-suggest call failed', e);
      }

      // After AI messages persisted, send email summary via email-summary function
      try {
        const site = process.env.SITE_ORIGIN || process.env.URL || '';
        const emailUrl = (site ? site.replace(/\/$/, '') : '') + EMAIL_SUMMARY_PATH;
        if (site) {
          // server-side call to our own function
          await fetch(emailUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concierge_id: cid })
          });
        } else {
          // fallback local call
          await fetch(`http://localhost:8888${EMAIL_SUMMARY_PATH}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concierge_id: cid })
          });
        }

        // Auto-archive after sending email
        await supabase.from('concierge').update({ status: 'Archived', conversation_open: false, last_activity: new Date().toISOString() }).eq('id', cid);
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
};;
