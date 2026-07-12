import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | FHJ Dream Destinations',
  description: 'How FHJ Dream Destinations collects, uses, and protects your personal information.',
}

const SECTIONS: { title: string; body: (string | { list: string[] })[] }[] = [
  {
    title: 'Who We Are',
    body: [
      'FHJ Dream Destinations is a boutique luxury travel agency serving the Tri-State Area and travelers worldwide. This policy explains what personal information we collect through fhjdreamdestinations.com, why we collect it, and how we protect it.',
      'If you have any questions about this policy or your information, contact us at info@fhjdreamdestinations.com or 484-541-3573.',
    ],
  },
  {
    title: 'Information We Collect',
    body: [
      'We only collect information you choose to share with us:',
      {
        list: [
          'Contact details — your name, email address, and phone number when you book a consultation, submit a trip request, or subscribe to our newsletter.',
          'Trip planning details — information you provide in our client intake form, such as date of birth, nationality, passport number, home address, traveler preferences, and details about who you are traveling with. We ask for these because airlines, cruise lines, hotels, and destination countries require them to confirm reservations.',
          'Appointment details — the date, time, and purpose of consultations you schedule with us.',
          'Client portal account — if we set up a portal account for you, we store your login email and the trip documents we share with you.',
        ],
      },
      'We do not use advertising trackers or sell your attention. Our website uses only the cookies necessary to keep you signed in to the client portal.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      {
        list: [
          'To plan, quote, and book the travel you request.',
          'To communicate with you about your trip, appointments, and requests.',
          'To send you our newsletter, if you subscribed — you can unsubscribe at any time.',
          'To meet legal and supplier requirements connected to your bookings.',
        ],
      },
      'We never sell your personal information. Ever.',
    ],
  },
  {
    title: 'Who We Share It With',
    body: [
      'We share your information only when it is needed to deliver your trip or run our business:',
      {
        list: [
          'Travel suppliers — airlines, cruise lines, hotels, tour operators, and travel insurers, strictly as required to confirm your bookings.',
          'Service providers — the secure database that stores our client records and the email service that delivers our messages. These providers process data on our behalf and are not permitted to use it for their own purposes.',
          'Legal requirements — if the law requires us to disclose information, we will.',
        ],
      },
    ],
  },
  {
    title: 'How We Protect It',
    body: [
      'Your information is stored in an access-controlled database with row-level security, encrypted in transit. Sensitive details such as passport numbers are accessible only to the FHJ team members who need them to complete your bookings.',
    ],
  },
  {
    title: 'How Long We Keep It',
    body: [
      'We keep trip and client records for as long as needed to service your travel and satisfy legal, tax, and supplier requirements. If you ask us to delete your information, we will remove everything we are not legally required to retain.',
    ],
  },
  {
    title: 'Your Choices',
    body: [
      {
        list: [
          'Ask us what information we hold about you.',
          'Ask us to correct or delete your information.',
          'Unsubscribe from the newsletter at any time.',
        ],
      },
      'To exercise any of these, email info@fhjdreamdestinations.com and we will respond promptly.',
    ],
  },
  {
    title: 'Children',
    body: [
      'Our website and services are not directed to children under 13, and we do not knowingly collect information from them. Traveler details for minors traveling with your party are provided by you, the responsible adult, solely to complete bookings.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'If we make meaningful changes to this policy, we will update this page and revise the effective date below.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ background: '#FDFAF3', overflowX: 'hidden' }}>
      <Navigation />

      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '160px 40px 80px', background: 'linear-gradient(160deg, #FDFAF3 0%, #EDF7F7 55%, #FDFAF3 100%)' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 7, color: '#3A7D7D', marginBottom: 20, fontWeight: 600 }}>✦ YOUR TRUST MATTERS ✦</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(44px, 8vw, 80px)', fontWeight: 300, lineHeight: 0.95, color: '#2E2318', marginBottom: 16 }}>
          Privacy <em style={{ color: '#3A7D7D' }}>Policy</em>
        </h1>
        <div style={{ width: 3, height: 56, background: 'linear-gradient(to bottom, #3A7D7D, #C49A45)', margin: '28px auto', borderRadius: 2 }} />
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(18px, 2.2vw, 22px)', color: 'rgba(44,32,16,0.7)', lineHeight: 1.75, fontStyle: 'italic', maxWidth: 620, margin: '0 auto' }}>
          You trust us with the details of your journeys — here is exactly how we look after them.
        </p>
      </div>

      {/* Body */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '40px 32px 100px' }}>
        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom: 52 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 4, color: '#3A7D7D', marginBottom: 8, fontWeight: 700 }}>{s.title.toUpperCase()}</div>
            <div style={{ width: 44, height: 2, background: 'linear-gradient(90deg, #3A7D7D, #C49A45)', marginBottom: 20, borderRadius: 2 }} />
            {s.body.map((b, i) =>
              typeof b === 'string' ? (
                <p key={i} style={{ fontSize: 16, color: 'rgba(44,32,16,0.78)', lineHeight: 1.85, marginBottom: 14 }}>{b}</p>
              ) : (
                <ul key={i} style={{ paddingLeft: 22, marginBottom: 14 }}>
                  {b.list.map(item => (
                    <li key={item} style={{ fontSize: 16, color: 'rgba(44,32,16,0.78)', lineHeight: 1.85, marginBottom: 10 }}>{item}</li>
                  ))}
                </ul>
              )
            )}
          </div>
        ))}

        <div style={{ borderTop: '1px solid rgba(196,154,69,0.25)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color: 'rgba(44,32,16,0.5)' }}>EFFECTIVE: JULY 12, 2026</span>
          <Link href="/" style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color: '#3A7D7D', textDecoration: 'none' }}>← BACK TO HOME</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
