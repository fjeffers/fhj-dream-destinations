// netlify/functions/admin-dashboard-event-attendance.js
const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const TABLE_EVENTS = "Events";
  const TABLE_RSVPS = "RSVPs";

  const events = await selectRecords(TABLE_EVENTS);
  const rsvps = await selectRecords(TABLE_RSVPS);

  const eventMap = {};

  events.forEach((ev) => {
    eventMap[ev.id] = {
      eventId: ev.id,
      title: ev.Title || "Untitled Event",
      total: 0,
      yes: 0,
      no: 0,
      maybe: 0,
      guests: 0,
    };
  });

  rsvps.forEach((r) => {
    const eventId = r.Event && r.Event[0];
    if (!eventId || !eventMap[eventId]) return;

    const attending = (r.Attending || "").trim();
    const guests = Number(r.Guests || 0);

    eventMap[eventId].total += 1;
    eventMap[eventId].guests += guests;

    if (attending === "Yes") eventMap[eventId].yes += 1;
    else if (attending === "No") eventMap[eventId].no += 1;
    else if (attending === "Maybe") eventMap[eventId].maybe += 1;
  });

  const data = Object.values(eventMap).map((ev) => ({
    title: ev.title,
    total: ev.total,
    yes: ev.yes,
    no: ev.no,
    maybe: ev.maybe,
    guests: ev.guests,
    attendanceRate: ev.total > 0 ? +(ev.yes / ev.total * 100).toFixed(1) : 0,
  }));

  return respond(200, { success: true, data });
});
