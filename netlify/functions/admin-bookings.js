const {
  supabase,
  respond,
} = require('./utils');

const { withFHJ } = require('./middleware');

// Supabase bookings table columns (actual schema):
// id, client_name, client_email, client_phone, client_id, date, time, destination,
// status, notes, reason, type, trip_type, occasion, group_size, budget_range,
// flexible_dates, vacation_start, vacation_end, duration_minutes, is_returning,
// end_time, created_at

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;
  const payload = method !== 'GET' ? JSON.parse(event.body || '{}') : {};

  // 🟢 GET: Fetch all bookings
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return respond(500, { error: error.message });

    // Return camelCase shape that AdminBookings.jsx expects
    const bookings = (data || []).map(row => ({
      id: row.id,
      clientName: row.client_name || row.client_email || 'Unknown',
      email: row.client_email || '',
      tripName: row.destination || 'Unspecified',
      travelDates: row.date || 'TBD',
      status: row.status || 'Pending',
    }));

    return respond(200, { bookings });
  }

  // 🟡 POST: Create new booking
  if (method === 'POST') {
    if (!payload.email || !payload.tripName) {
      return respond(400, { error: 'Missing required fields (email, tripName)' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        client_name: payload.clientName || payload.email,
        client_email: payload.email,
        destination: payload.tripName,
        date: payload.travelDates || null,
        status: payload.status || 'Pending',
      }])
      .select()
      .single();

    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true, id: data.id });
  }

  // 🟠 PUT: Update booking
  if (method === 'PUT') {
    if (!payload.id) return respond(400, { error: 'Missing Booking ID' });

    const updates = {};
    if (payload.clientName !== undefined) updates.client_name = payload.clientName;
    if (payload.email !== undefined) updates.client_email = payload.email;
    if (payload.tripName !== undefined) updates.destination = payload.tripName;
    if (payload.travelDates !== undefined) updates.date = payload.travelDates;
    if (payload.status !== undefined) updates.status = payload.status;

    if (Object.keys(updates).length === 0) {
      return respond(400, { error: 'No fields to update' });
    }

    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', payload.id);

    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true });
  }

  // 🔴 DELETE: Remove booking
  if (method === 'DELETE') {
    if (!payload.id) return respond(400, { error: 'Missing Booking ID' });

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', payload.id);

    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true });
  }

  return respond(405, { error: 'Method not allowed' });
});