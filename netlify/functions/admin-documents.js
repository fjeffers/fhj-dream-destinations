// netlify/functions/admin-documents.js
const { supabase, respond } = require('./utils');
const { withFHJ } = require('./middleware');

// Supabase documents table columns:
// id, name, url, type, client_email, created_at

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;

  // GET: list all documents
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return respond(500, { error: error.message });

    // Normalise to a consistent shape for the frontend
    const documents = (data || []).map(row => ({
      id: row.id,
      name: row.name || '',
      url: row.url || '',
      type: row.type || '',
      clientEmail: row.client_email || '',
      createdAt: row.created_at,
    }));

    return respond(200, { documents });
  }

  // Parse JSON body for POST / PUT / DELETE
  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid JSON body' });
  }

  // POST: create document record (expects URL already uploaded via upload-image)
  if (method === 'POST') {
    if (!payload.name || !payload.url) {
      return respond(400, { error: 'Missing required fields: name, url' });
    }

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        name: payload.name,
        url: payload.url,
        type: payload.type || 'Other',
        client_email: payload.clientEmail || payload.email || null,
      }])
      .select()
      .single();

    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true, id: data.id });
  }

  // PUT: update document metadata
  if (method === 'PUT') {
    if (!payload.id) return respond(400, { error: 'Missing document ID' });

    const updates = {};
    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.url !== undefined) updates.url = payload.url;
    if (payload.type !== undefined) updates.type = payload.type;
    if (payload.clientEmail !== undefined) updates.client_email = payload.clientEmail;
    if (payload.email !== undefined) updates.client_email = payload.email;

    if (Object.keys(updates).length === 0) {
      return respond(400, { error: 'No fields to update' });
    }

    const { error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', payload.id);

    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true });
  }

  // DELETE: remove document
  if (method === 'DELETE') {
    if (!payload.id) return respond(400, { error: 'Missing document ID' });

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', payload.id);

    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true });
  }

  return respond(405, { error: 'Method not allowed' });
});
