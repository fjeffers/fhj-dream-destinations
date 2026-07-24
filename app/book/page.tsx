'use client'
import { useState } from 'react'
import { notifyIntakeSubmitted, sendClientConfirmation } from '@/lib/sendEmail'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

// ── COLORS ───────────────────────────────────────────────────
const C = {
  cream: '#F9F7F2', sand: '#F5ECD7', gold: '#B08D57',
  teal: '#3A7D7D', brown: '#2D2926', muted: '#8A7A6A',
  text: '#2E2318', border: '#E8E4DB',
}

// ── SHARED INPUT STYLE ───────────────────────────────────────
const IS: React.CSSProperties = {
  width: '100%', padding: '13px 16px', border: `1.5px solid ${C.border}`,
  borderRadius: 6, fontSize: 15, fontFamily: 'Lato, sans-serif',
  color: C.text, background: 'white', outline: 'none', boxSizing: 'border-box',
}

// ── STEPS ────────────────────────────────────────────────────
const STEPS = ['Personal Info', 'Occasion', 'Trip Type', 'The Details', 'Traveler Profile', 'Review & Submit']

// ── TRIP TYPES ───────────────────────────────────────────────
const TRIP_TYPES = [
  { id: 'cruise',    icon: '🚢', label: 'Luxury Cruise',     sub: 'Sail the world in style' },
  { id: 'safari',    icon: '🦁', label: 'Safari Adventure',  sub: 'Wild Africa awaits' },
  { id: 'beach',     icon: '🏝️', label: 'Tropical Escape',   sub: 'Sun, sand & serenity' },
  { id: 'europe',    icon: '🏛️', label: 'European Culture',  sub: 'History, food & romance' },
  { id: 'asia',      icon: '⛩️', label: 'Asia & Pacific',    sub: 'Ancient meets modern' },
  { id: 'adventure', icon: '🏔️', label: 'Adventure Trip',   sub: 'Push the boundaries' },
  { id: 'wellness',  icon: '🌿', label: 'Wellness Retreat',  sub: 'Rest, renew, recharge' },
  { id: 'custom',    icon: '✨', label: 'Something Custom',  sub: "We'll build it together" },
]

// ── OCCASIONS ────────────────────────────────────────────────
const OCCASIONS = [
  { id: 'honeymoon',     icon: '💍', label: 'Honeymoon',         sub: 'Just married or soon to be' },
  { id: 'wedding',       icon: '💒', label: 'Wedding Trip',       sub: 'Before or after the big day' },
  { id: 'anniversary',   icon: '❤️',  label: 'Anniversary',       sub: 'Celebrating your love' },
  { id: 'birthday',      icon: '🎂', label: 'Birthday Getaway',  sub: 'Make it unforgettable' },
  { id: 'romance',       icon: '🌹', label: 'Romantic Escape',   sub: 'Just the two of you' },
  { id: 'family',        icon: '👨‍👩‍👧‍👦', label: 'Family Vacation', sub: 'Memories for everyone' },
  { id: 'family_reunion',icon: '🏡', label: 'Family Reunion',    sub: 'Bring everyone together' },
  { id: 'friends',       icon: '🥂', label: 'Friends Trip',      sub: 'Squad getaway' },
  { id: 'graduation',    icon: '🎓', label: 'Graduation Trip',   sub: 'You earned it' },
  { id: 'business',      icon: '💼', label: 'Business Travel',   sub: 'Work hard, travel well' },
  { id: 'corporate',     icon: '🤝', label: 'Corporate Retreat', sub: 'Team building in style' },
  { id: 'bucket_list',   icon: '✈️', label: 'Bucket List Trip',  sub: 'The one you always dreamed of' },
  { id: 'solo',          icon: '🧘', label: 'Solo Adventure',    sub: 'Just you and the world' },
  { id: 'wellness',      icon: '🌿', label: 'Wellness Retreat',  sub: 'Rest, recharge, renew' },
  { id: 'reunion',       icon: '👥', label: 'Reunion Trip',      sub: 'Old friends, new memories' },
  { id: 'vacation',      icon: '☀️', label: 'Just a Vacation',   sub: 'No occasion needed — just go' },
  { id: 'other',         icon: '⭐', label: 'Something Special', sub: 'Tell us what it is' },
]

// ── TRIP TYPE QUESTIONS ──────────────────────────────────────
const TRIP_QUESTIONS: Record<string, any[]> = {
  cruise: [
    { id: 'cruise_line', label: 'Preferred Cruise Line Style', type: 'select', options: ['Ultra-Luxury (Silversea, Seabourn)', 'Premium (Celebrity, Holland America)', 'River Cruise', 'Expedition / Adventure', 'No Preference — Show Me the Best'] },
    { id: 'cabin_pref', label: 'Cabin Style', type: 'select', options: ['Cozy Interior', 'Ocean View Balcony', 'Luxury Suite', "Penthouse / Owner's Suite"] },
    { id: 'cruise_region', label: 'Preferred Region', type: 'select', options: ['Caribbean', 'Mediterranean', 'Alaska', 'Europe (Northern)', 'Asia Pacific', 'South America', 'Africa & Indian Ocean', 'Surprise Me'] },
    { id: 'sea_legs', label: 'Have you cruised before?', type: 'select', options: ['First time — excited!', 'A few times', 'Frequent cruiser', 'Veteran — know exactly what I want'] },
  ],
  safari: [
    { id: 'safari_priority', label: 'Safari Priority', type: 'select', options: ['The Big 5 Wildlife', 'Photographic Safari', 'Luxury Glamping Experience', 'Community & Cultural', 'All of the Above'] },
    { id: 'safari_region', label: 'Preferred Region', type: 'select', options: ['Kenya (Maasai Mara)', 'Tanzania (Serengeti)', 'South Africa (Kruger)', 'Botswana (Okavango)', 'Rwanda (Gorillas)', 'Surprise Me'] },
    { id: 'camp_style', label: 'Camp / Lodge Style', type: 'select', options: ['Ultra-Luxury Tented Lodge', 'Private Game Reserve', 'Boutique Bush Lodge', 'Mobile Safari', 'Mix of Experiences'] },
    { id: 'safari_duration', label: 'Ideal Duration', type: 'select', options: ['3-4 nights', '5-7 nights', '8-10 nights', '2 weeks+'] },
  ],
  beach: [
    { id: 'beach_dest', label: 'Dream Beach Destination', type: 'select', options: ['Maldives', 'Bora Bora', 'Turks & Caicos', 'St. Barts', 'Seychelles', 'Amalfi Coast', 'Caribbean Islands', 'Surprise Me'] },
    { id: 'beach_stay', label: 'Accommodation Dream', type: 'select', options: ['Overwater Bungalow', 'Private Villa with Pool', 'Beachfront Resort', 'All-Inclusive Luxury', 'Boutique Beach Hotel'] },
    { id: 'beach_vibe', label: 'Beach Vibe', type: 'select', options: ['Pure relaxation — do nothing', 'Mix of relax & explore', 'Active — watersports & excursions', 'Romantic & intimate', 'Family fun'] },
  ],
  europe: [
    { id: 'europe_region', label: 'European Region', type: 'select', options: ['Italy (Amalfi, Tuscany, Rome)', 'France (Paris, Riviera)', 'Greece (Santorini, Mykonos)', 'Spain & Portugal', 'UK & Ireland', 'Eastern Europe', 'Scandinavia', 'Multi-Country'] },
    { id: 'europe_style', label: 'Travel Style in Europe', type: 'select', options: ['Slow travel — one city/region', 'Classic highlights tour', 'Off the beaten path', 'Food & wine focus', 'Art & history deep dive', 'Mix of everything'] },
    { id: 'transport_pref', label: 'Getting Around', type: 'select', options: ['Private car & driver', 'First-class rail', 'River cruise + land', 'Private yacht', 'Mix — best for each leg'] },
  ],
  asia: [
    { id: 'asia_dest', label: 'Asia Destination', type: 'select', options: ['Japan (Tokyo, Kyoto, Osaka)', 'Bali & Indonesia', 'Thailand', 'Vietnam', 'Maldives', 'India', 'Multi-Destination', 'Surprise Me'] },
    { id: 'asia_style', label: 'Asia Travel Style', type: 'select', options: ['Cultural immersion', 'Luxury beach & resort', 'Adventure & trekking', 'Spiritual & wellness', 'Food & culinary focus', 'Mix of all'] },
  ],
  adventure: [
    { id: 'adventure_type', label: 'Adventure Type', type: 'select', options: ['Hiking & Trekking', 'Water Sports & Diving', 'Wildlife & Nature', 'Cycling & Biking', 'Winter Sports / Skiing', 'Expedition (Poles, Rainforest)', 'Multi-Sport'] },
    { id: 'fitness_level', label: 'Fitness & Activity Level', type: 'select', options: ['Moderate — enjoy being active', 'Active — challenging is good', 'High — push me to my limits', 'Extreme — nothing is too hard'] },
    { id: 'adventure_dest', label: 'Dream Adventure Region', type: 'select', options: ['Patagonia', 'New Zealand', 'Iceland', 'Nepal & Himalayas', 'Alaska', 'Amazon Rainforest', 'Antarctica', 'Surprise Me'] },
  ],
  wellness: [
    { id: 'wellness_focus', label: 'Wellness Focus', type: 'select', options: ['Spa & Beauty Treatments', 'Yoga & Meditation', 'Digital Detox', 'Fitness & Movement', 'Nutrition & Healthy Eating', 'Complete Holistic Reset'] },
    { id: 'wellness_dest', label: 'Wellness Setting', type: 'select', options: ['Tropical Island Retreat', 'Mountain Sanctuary', 'Desert Escape', 'European Spa Hotel', 'Bali / Southeast Asia', 'Anywhere Peaceful'] },
    { id: 'wellness_intensity', label: 'Program Intensity', type: 'select', options: ['Very gentle & relaxing', 'Light — some structure', 'Moderate program', 'Intensive — transform me'] },
  ],
  custom: [
    { id: 'custom_dream', label: 'Describe Your Dream Trip', type: 'textarea', placeholder: 'Paint us a picture — where, what, who, why...' },
    { id: 'custom_inspiration', label: 'What Inspired This Trip?', type: 'text', placeholder: "A movie, a book, a friend's story..." },
  ],
}

// ── OCCASION QUESTIONS ───────────────────────────────────────
const OCCASION_QUESTIONS: Record<string, any[]> = {
  honeymoon: [
    { id: 'wedding_date', label: 'Wedding Date', type: 'date' },
    { id: 'honeymoon_vibe', label: 'Honeymoon Vibe', type: 'select', options: ['Ultra Romantic & Private', 'Adventure Together', 'Beach & Relaxation', 'Culture & Exploration', 'Mix of Everything'] },
    { id: 'surprise_planning', label: 'Should we plan surprise moments?', type: 'select', options: ['Yes — surprise us!', 'Some surprises are fine', 'No, we prefer to know everything'] },
    { id: 'romantic_touches', label: 'Dream Romantic Touches', type: 'text', placeholder: 'Rose petals, private dinner on the beach, couples spa...' },
  ],
  wedding: [
    { id: 'wedding_type', label: 'Type of Wedding Travel', type: 'select', options: ['Pre-wedding / Bachelorette trip', 'Destination wedding', 'Post-wedding honeymoon', 'Wedding anniversary trip', 'Wedding party group trip'] },
    { id: 'wedding_date', label: 'Wedding Date', type: 'date' },
    { id: 'wedding_size', label: 'Group Size for This Trip', type: 'select', options: ['Just the couple', 'Small wedding party (3-8)', 'Medium group (9-20)', 'Large group (20+)'] },
    { id: 'wedding_wish', label: 'Dream Wedding Travel Moment', type: 'text', placeholder: 'Vow renewal on the beach, private villa celebration...' },
  ],
  anniversary: [
    { id: 'anniversary_number', label: 'Which Anniversary?', type: 'select', options: ['1st', '5th', '10th', '20th', '25th', '30th', '40th', '50th', 'Other'] },
    { id: 'previous_trips', label: "Best Trip You've Taken Together", type: 'text', placeholder: 'Help us top it...' },
    { id: 'anniversary_vibe', label: 'Anniversary Style', type: 'select', options: ['Return to a special place', 'Brand new destination', 'Something completely different', 'Surprise me'] },
  ],
  birthday: [
    { id: 'birthday_person', label: "Whose Birthday?", type: 'select', options: ['Mine', "My partner's", "Friend's", "Parent's", "Child's"] },
    { id: 'milestone_age', label: 'Milestone Age?', type: 'select', options: ['30', '40', '50', '60', '70', '80+', 'Not a milestone'] },
    { id: 'birthday_vibe', label: 'Birthday Energy', type: 'select', options: ['Party & Celebration', 'Relaxed & Luxurious', 'Adventure & Thrills', 'Spa & Wellness', 'Culture & Discovery'] },
    { id: 'birthday_wish', label: 'One Birthday Dream Moment', type: 'text', placeholder: 'Surprise cake, group dinner, private event...' },
  ],
  romance: [
    { id: 'romance_setting', label: 'Most Romantic Setting', type: 'select', options: ['Completely private & secluded island', 'Charming European city', 'Beachfront at sunset', 'Mountain hideaway', 'Historic countryside villa'] },
    { id: 'pace', label: 'Travel Pace', type: 'select', options: ['Slow & luxurious — one place only', 'Two or three destinations', 'See as much as possible'] },
  ],
  family: [
    { id: 'children_ages', label: 'Ages of the Little Explorers', type: 'text', placeholder: 'e.g. Leo (7), Maya (11)' },
    { id: 'kids_room', label: 'Room Arrangement', type: 'select', options: ['All together in one room', 'Connecting rooms', 'Separate but nearby', 'Private villa — everyone has space'] },
    { id: 'kid_interests', label: 'What Do the Kids Love?', type: 'select', options: ['Beach & Water Parks', 'Wildlife & Animals', 'Theme Parks', 'History & Museums', 'Outdoor Adventures', 'Everything!'] },
    { id: 'adult_needs', label: 'Adult Must-Haves', type: 'text', placeholder: 'Spa time, fine dining, adult pool...' },
  ],
  family_reunion: [
    { id: 'reunion_size', label: 'How Many Family Members?', type: 'select', options: ['10-20', '21-40', '41-75', '75+'] },
    { id: 'age_range', label: 'Age Range in the Group', type: 'select', options: ['All adults', 'Mixed — adults & kids', 'Multi-generational (grandparents to grandkids)', 'Mostly seniors'] },
    { id: 'reunion_style', label: 'Reunion Style', type: 'select', options: ['All-inclusive resort — everyone together', 'Private villa or estate rental', 'Cruise ship — best for big groups', 'Beach destination', 'City break'] },
    { id: 'reunion_activities', label: 'Must-Have Group Activities', type: 'text', placeholder: 'Group dinners, team activities, excursions, photography...' },
    { id: 'reunion_frequency', label: 'How Often Do You Reunite?', type: 'select', options: ['First time!', 'Every year', 'Every few years', 'Special milestone occasion'] },
  ],
  friends: [
    { id: 'group_size_friends', label: 'How Many Friends?', type: 'select', options: ['2-3', '4-6', '7-10', '10+'] },
    { id: 'group_vibe', label: 'Group Energy', type: 'select', options: ['Party & Nightlife', 'Adventure & Outdoors', 'Relaxed & Luxurious', 'Food & Culture', 'Mix of Everything'] },
    { id: 'stay_together', label: 'Accommodation', type: 'select', options: ['Private villa — all together', 'Boutique hotel with adjoining rooms', 'Luxury resort', "Whatever's best for the group"] },
  ],
  graduation: [
    { id: 'grad_level', label: 'Graduation Level', type: 'select', options: ['High School', 'Undergraduate', 'Graduate / Masters', 'Doctorate', 'Professional (MD, JD, MBA)'] },
    { id: 'grad_vibe', label: 'Celebration Style', type: 'select', options: ['Once-in-a-lifetime experience', 'Party & adventure', 'Relax & recharge', 'Explore the world', 'Gap year starter'] },
    { id: 'grad_with', label: 'Traveling With', type: 'select', options: ['Solo', 'Friends', 'Family', 'Partner'] },
  ],
  business: [
    { id: 'business_purpose', label: 'Purpose of Travel', type: 'select', options: ['Client meetings', 'Conference or trade show', 'Site visit', 'Training or workshop', 'Mixed — business & leisure (bleisure)'] },
    { id: 'business_class', label: 'Travel Class Preference', type: 'select', options: ['Business class only', 'First class', 'Premium economy acceptable', 'Whatever is fastest'] },
    { id: 'hotel_pref', label: 'Hotel Preference', type: 'select', options: ['5-Star business hotel', 'Boutique luxury', 'Near conference venue', 'Airport proximity important', 'Best available'] },
    { id: 'bleisure', label: 'Adding Leisure Days?', type: 'select', options: ['Yes — extend the trip for fun', 'Maybe — depends on schedule', 'No — strictly business'] },
  ],
  corporate: [
    { id: 'team_size', label: 'Team Size', type: 'select', options: ['5-10', '11-25', '26-50', '50+'] },
    { id: 'retreat_goals', label: 'Retreat Goals', type: 'select', options: ['Team bonding', 'Strategy & planning offsite', 'Reward & recognition', 'Product launch event', 'Mix of work & play'] },
    { id: 'meeting_space', label: 'Meeting Space Needed?', type: 'select', options: ['Yes — full conference setup', 'Yes — informal meeting space', 'No — purely leisure'] },
  ],
  bucket_list: [
    { id: 'bucket_dream', label: 'The Dream Destination', type: 'text', placeholder: "Where have you always wanted to go?" },
    { id: 'bucket_experience', label: 'The Must-Do Experience', type: 'text', placeholder: 'Northern Lights, Machu Picchu, Overwater villa, safari dawn...' },
    { id: 'why_now', label: 'Why Now?', type: 'select', options: ['Milestone birthday', 'Life achievement', "Always been the dream", 'Now or never', 'Someone inspired me'] },
  ],
  solo: [
    { id: 'solo_style', label: 'Solo Travel Style', type: 'select', options: ['Complete solitude & peace', 'Social — meet new people', 'Mix of solo & social', 'Structured tours with free time'] },
    { id: 'solo_seeking', label: 'What Are You Looking For?', type: 'select', options: ['Adventure & excitement', 'Rest & wellness', 'Self-discovery', 'Cultural immersion', 'Just a break from everything'] },
  ],
  reunion: [
    { id: 'reunion_type', label: 'Type of Reunion', type: 'select', options: ['College / School friends', 'Military reunion', 'Childhood friends', 'Former colleagues', 'Sports team', 'Community group', 'Other'] },
    { id: 'how_long_apart', label: "How Long Since You've All Been Together?", type: 'select', options: ['1-2 years', '3-5 years', '5-10 years', '10-20 years', '20+ years'] },
    { id: 'reunion_group_size', label: 'Group Size', type: 'select', options: ['5-10', '11-20', '21-40', '40+'] },
    { id: 'reunion_vibe', label: 'Reunion Vibe', type: 'select', options: ['Relaxed & catch up', 'Party & celebration', 'Adventure together', 'Mix of activities & downtime'] },
  ],
  vacation: [
    { id: 'vacation_mood', label: 'What Do You Need Right Now?', type: 'select', options: ['Complete relaxation — do nothing', 'Some adventure mixed in', 'See new places & explore', 'Food, culture & experiences', 'Mix of everything'] },
    { id: 'vacation_with', label: 'Traveling With', type: 'select', options: ['Solo', 'Partner / Couple', 'Family with kids', 'Friends group', 'Extended family'] },
    { id: 'vacation_priority', label: 'Top Priority for This Trip', type: 'select', options: ['Beach & sun', 'Great food & dining', 'Sightseeing & culture', 'Luxury & pampering', 'Adventure & outdoors', 'All of the above'] },
  ],
  other: [
    { id: 'occasion_desc', label: "Tell Us What You're Celebrating", type: 'text', placeholder: "What's the special occasion?" },
    { id: 'trip_meaning', label: 'What Would Make This Trip Perfect?', type: 'textarea', placeholder: 'In your own words...' },
  ],
}

// ── TRAVELER PROFILE ─────────────────────────────────────────
const TRAVELER_QUESTIONS = [
  { id: 'travel_experience', label: 'Your Travel Experience Level', type: 'select', options: ['First time international traveler', 'Occasional (1-2 trips/year)', 'Frequent traveler (3-5 trips/year)', 'Seasoned luxury traveler'] },
  { id: 'pace_preference', label: 'Preferred Travel Pace', type: 'select', options: ['Slow & immersive — one destination', 'Moderate — a couple of stops', 'Fast — see as much as possible'] },
  { id: 'cuisine_pref', label: 'Dining Style', type: 'select', options: ['Fine dining every night', 'Mix of fine & local restaurants', 'Local & authentic experiences', 'No preference'] },
  { id: 'privacy_pref', label: 'Privacy Preference', type: 'select', options: ['Complete privacy — private villa or resort', 'Semi-private — boutique hotel', 'Social atmosphere — larger resort', 'No preference'] },
  { id: 'dream_moment', label: 'One Thing That Would Make This Trip Absolutely Perfect', type: 'textarea', placeholder: 'Your dream moment — no matter how big or small...' },
]

// ── REUSABLE COMPONENTS ──────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: C.brown, fontWeight: 700, display: 'block', marginBottom: 6 }}>
    {String(children).toUpperCase()}
  </label>
)

function SelectionCard({ item, selected, onSelect }: { item: any; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{
      padding: '18px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
      border: `2px solid ${selected ? C.teal : C.border}`,
      background: selected ? 'rgba(58,125,125,0.07)' : 'white',
      transition: 'all 0.2s',
      boxShadow: selected ? '0 4px 16px rgba(58,125,125,0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, color: selected ? C.teal : C.text, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{item.label}</div>
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.3 }}>{item.sub}</div>
      {selected && <div style={{ marginTop: 8, width: 20, height: 20, borderRadius: '50%', background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px auto 0', color: 'white', fontSize: 11 }}>✓</div>}
    </div>
  )
}

function DynField({ q, answers, onChange }: { q: any; answers: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Label>{q.label}</Label>
      {q.type === 'select' ? (
        <select style={IS} value={answers[q.id] || ''} onChange={e => onChange(q.id, e.target.value)}>
          <option value="">Select an option</option>
          {q.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : q.type === 'textarea' ? (
        <textarea style={{ ...IS, resize: 'vertical', minHeight: 100 } as React.CSSProperties} rows={4}
          placeholder={q.placeholder || ''} value={answers[q.id] || ''}
          onChange={e => onChange(q.id, e.target.value)} />
      ) : (
        <input style={IS} type={q.type} placeholder={q.placeholder || ''}
          value={answers[q.id] || ''} onChange={e => onChange(q.id, e.target.value)} />
      )}
    </div>
  )
}

// ── SUCCESS VIEW ─────────────────────────────────────────────
function SuccessView({ name, icon, trip, occasion }: { name: string; icon?: string; trip?: string; occasion?: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.cream, padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, #2d6666)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: 42 }}>{icon || '✦'}</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, fontWeight: 300, color: C.text, marginBottom: 14 }}>
          You're All Set, <em style={{ color: C.teal }}>{name}!</em>
        </h2>
        <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 12 }}>
          We've received your {occasion?.toLowerCase()} {trip?.toLowerCase()} request and we're already excited to start planning.
        </p>
        <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
          One of our travel architects will reach out within <strong>24 hours</strong> to begin crafting your perfect journey.
        </p>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, marginBottom: 36 }} />
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 4, color: C.teal, marginBottom: 32 }}>YOUR ADVENTURE BEGINS NOW ✦</p>
        <Link href="/" style={{ display: 'inline-block', padding: '14px 44px', border: `2px solid ${C.teal}`, color: C.teal, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textDecoration: 'none', borderRadius: 6 }}>Return Home</Link>
      </div>
    </div>
  )
}

// ── MAIN PAGE ────────────────────────────────────────────────
export default function BookPage() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<Record<string, any>>({
    trip_answers: {}, occasion_answers: {}, traveler_answers: {},
    group_size: '2', preferred_contact: 'Email',
    first_name: '', last_name: '', email: '', phone: '',
    dob: '', passport_num: '', nationality: '',
    address: '', city: '', state: '', zip: '', country: '',
    trip_type: '', special_occasion: '',
    destination: '', travel_dates: '', return_date: '',
    budget: '', accommodation: '',
    emergency_name: '', emergency_phone: '', emergency_relation: '',
    heard_from: '', notes: '',
  })

  const upd = (key: string, val: any, section?: string) => {
    setForm(prev => {
      let newVal = val

      // 1. Phone Number Auto-Formatting (US Style) with Delete Support
      if (key === 'phone') {
        const digits = String(val).replace(/\D/g, '').substring(0, 10)
        const prevDigits = String(prev.phone || '').replace(/\D/g, '')
        if (digits.length < prevDigits.length) {
          newVal = val
        } else {
          const size = digits.length
          if (size > 6) newVal = `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`
          else if (size > 3) newVal = `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}`
          else if (size > 0) newVal = `(${digits}`
        }
      }

      const next = section
        ? { ...prev, [section]: { ...prev[section], [key]: newVal } }
        : { ...prev, [key]: newVal }

      // 2. Auto-set Return Date (Departure + 7 Days)
      if (key === 'travel_dates' && newVal) {
        const parts = newVal.split('-').map(Number)
        const start = new Date(parts[0], parts[1] - 1, parts[2])
        if (!isNaN(start.getTime())) {
          const end = new Date(start)
          end.setDate(start.getDate() + 7)
          next.return_date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
        }
      }

      return next
    })
  }

  const updNested = (section: string, key: string, val: string) =>
    setForm(prev => ({ ...prev, [section]: { ...prev[section], [key]: val } }))

  const selectedTrip = TRIP_TYPES.find(t => t.id === form.trip_type)
  const selectedOccasion = OCCASIONS.find(o => o.id === form.special_occasion)
  const tripQ = TRIP_QUESTIONS[form.trip_type] || []
  const occQ = OCCASION_QUESTIONS[form.special_occasion] || []
  const today = new Date().toISOString().split('T')[0]

  // The multi-step form advances with a button, not a native submit, so the
  // browser never enforces type="email" — validate the address ourselves or a
  // malformed one reaches intake and silently breaks account creation later.
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())

  const canProceed = () => {
    if (step === 1) return !!(form.first_name && form.last_name && emailLooksValid)
    if (step === 2) return !!form.special_occasion
    if (step === 3) return !!form.trip_type
    if (step === 4) return !!(form.destination && form.travel_dates)
    return true
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    const supabase = createClient()
    const fmt = (ans: any, qList: any[]) =>
      Object.entries(ans).map(([k, v]) => `${qList.find(q => q.id === k)?.label || k}: ${v}`).join('\n')

    const notes_full = [
      form.notes,
      selectedTrip && `\n=== ${selectedTrip.label.toUpperCase()} ===\n${fmt(form.trip_answers, tripQ)}`,
      selectedOccasion && `\n=== ${selectedOccasion.label.toUpperCase()} ===\n${fmt(form.occasion_answers, occQ)}`,
      `\n=== TRAVELER PROFILE ===\n${fmt(form.traveler_answers, TRAVELER_QUESTIONS)}`,
    ].filter(Boolean).join('\n')

    const { error: err } = await supabase.from('intake_requests').insert({
      first_name: form.first_name, last_name: form.last_name,
      email: form.email, phone: form.phone, dob: form.dob || null,
      passport_num: form.passport_num, nationality: form.nationality,
      address: form.address, city: form.city, state: form.state,
      zip: form.zip, country: form.country,
      destination: form.destination,
      travel_dates: form.travel_dates || null,
      return_date: form.return_date || null,
      group_size: parseInt(form.group_size) || 2,
      budget: form.budget, accommodation: form.accommodation,
      special_occasion: `${selectedTrip?.label || ''} — ${selectedOccasion?.label || ''}`,
      emergency_name: form.emergency_name,
      emergency_phone: form.emergency_phone,
      emergency_relation: form.emergency_relation,
      heard_from: form.heard_from,
      preferred_contact: form.preferred_contact,
      notes: notes_full,
      experience_types: [],
      status: 'Pending',
    })

    if (err) { setError(err.message); setLoading(false); return }

    notifyIntakeSubmitted({
      first_name: form.first_name, last_name: form.last_name,
      email: form.email, phone: form.phone,
      destination: form.destination, travel_dates: form.travel_dates,
      group_size: form.group_size, budget: form.budget,
      special_occasion: `${selectedTrip?.label || ''} — ${selectedOccasion?.label || ''}`,
      notes: notes_full,
    })
    sendClientConfirmation({
      to_email: form.email, to_name: form.first_name,
      subject: 'We Received Your Request — FHJ Dream Destinations',
      message: `Hi ${form.first_name},\n\nThank you for reaching out to FHJ Dream Destinations! We have received your travel request and are already excited to start planning.\n\nOccasion: ${selectedOccasion?.label || 'Not specified'}\nTrip Type: ${selectedTrip?.label || 'Not specified'}\nDestination: ${form.destination || 'To be determined'}\n\nOne of our travel architects will contact you within 24 hours.\n\nWarm regards,\nFHJ Dream Destinations Team\ninfo@fhjdreamdestinations.com`
    })

    setSubmitted(true); setLoading(false)
  }

  if (submitted) return (
    <>
      <Navigation />
      <SuccessView name={form.first_name} icon={selectedOccasion?.icon} trip={selectedTrip?.label} occasion={selectedOccasion?.label} />
      <Footer />
    </>
  )

  return (
    <>
      <Navigation />
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease; }
        input:focus, select:focus, textarea:focus { border-color: ${C.teal} !important; box-shadow: 0 0 0 3px rgba(58,125,125,0.1); }
        @media (max-width: 768px) {
          .book-page-top { padding-top: 72px !important; }
        }
      `}</style>
      <div className="book-page-top" style={{ minHeight: '100vh', padding: '100px 20px 80px', background: C.cream }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, color: C.teal, marginBottom: 12, fontWeight: 700 }}>CLIENT INTAKE FORM</div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, fontWeight: 300, color: C.text, margin: 0 }}>
              Help Us Read <em style={{ color: C.teal }}>Your Mind</em>
            </h1>
            <p style={{ color: C.muted, fontSize: 16, marginTop: 12, lineHeight: 1.7 }}>The more you share, the better we can make your trip extraordinary.</p>
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.teal}, transparent)`, width: 100, margin: '20px auto 0' }} />
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 44 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 48 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: step > i + 1 ? C.teal : step === i + 1 ? `linear-gradient(135deg, ${C.teal}, #2d6666)` : 'white',
                    border: step <= i + 1 ? (step === i + 1 ? 'none' : `2px solid ${C.border}`) : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step >= i + 1 ? 'white' : C.muted,
                    fontFamily: 'Cinzel, serif', fontSize: 12, transition: 'all 0.3s',
                    boxShadow: step === i + 1 ? `0 4px 16px rgba(58,125,125,0.3)` : 'none',
                  }}>{step > i + 1 ? '✓' : i + 1}</div>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: step === i + 1 ? C.teal : C.muted, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? C.teal : C.border, margin: '0 4px', marginBottom: 26, borderRadius: 2 }} />}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div style={{ background: 'white', borderRadius: 16, padding: '44px 48px', boxShadow: `0 8px 48px rgba(58,125,125,0.1)`, border: `1px solid ${C.border}` }}>
            {error && <div style={{ padding: '13px 18px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', color: '#c0392b', fontSize: 15, marginBottom: 24, borderRadius: 6 }}>{error}</div>}

            {/* STEP 1 — PERSONAL INFO */}
            {step === 1 && (
              <div className="fade-in">
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, color: C.text, marginBottom: 6 }}>Personal Information</h3>
                <p style={{ color: C.muted, fontSize: 15, marginBottom: 32 }}>Let's start with the basics so we know exactly who we're planning this dream trip for.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  {[
                    { id: 'first_name', label: 'First Name *', type: 'text' },
                    { id: 'last_name', label: 'Last Name *', type: 'text' },
                    { id: 'email', label: 'Email Address *', type: 'email' },
                    { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 000-0000' },
                    { id: 'dob', label: 'Date of Birth', type: 'date' },
                    { id: 'passport_num', label: 'Passport Number', type: 'text' },
                  ].map(f => (
                    <div key={f.id} style={{ marginBottom: 20 }}>
                      <Label>{f.label}</Label>
                      <input style={IS} type={f.type} placeholder={f.placeholder || ''}
                        value={form[f.id] || ''} onChange={e => upd(f.id, e.target.value)} />
                      {f.id === 'email' && form.email.trim() !== '' && !emailLooksValid && (
                        <div style={{ color: '#c0392b', fontSize: 13, marginTop: 6 }}>
                          Please enter a complete email address, e.g. name@gmail.com
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Label>Street Address</Label>
                  <input style={IS} type="text" value={form.address || ''} onChange={e => upd('address', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0 24px', marginBottom: 20 }}>
                  {[{ id: 'city', label: 'City' }, { id: 'state', label: 'State' }, { id: 'zip', label: 'ZIP' }].map(f => (
                    <div key={f.id}>
                      <Label>{f.label}</Label>
                      <input style={IS} type="text" value={form[f.id] || ''} onChange={e => upd(f.id, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  {[{ id: 'country', label: 'Country' }, { id: 'nationality', label: 'Nationality' }].map(f => (
                    <div key={f.id} style={{ marginBottom: 20 }}>
                      <Label>{f.label}</Label>
                      <input style={IS} type="text" value={form[f.id] || ''} onChange={e => upd(f.id, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — OCCASION */}
            {step === 2 && (
              <div className="fade-in">
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, color: C.text, marginBottom: 6 }}>What's the Occasion?</h3>
                <p style={{ color: C.muted, fontSize: 15, marginBottom: 28 }}>The reason for your trip shapes the magic we create. Select what best describes your journey.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
                  {OCCASIONS.map(o => (
                    <SelectionCard key={o.id} item={o} selected={form.special_occasion === o.id}
                      onSelect={() => { upd('special_occasion', o.id); setForm(p => ({ ...p, occasion_answers: {} })) }} />
                  ))}
                </div>
                {occQ.length > 0 && form.special_occasion && (
                  <div className="fade-in" style={{ paddingTop: 28, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <span style={{ fontSize: 26 }}>{selectedOccasion?.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color: C.teal, fontWeight: 700 }}>{selectedOccasion?.label?.toUpperCase()} DETAILS</div>
                        <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>Help us make your {selectedOccasion?.label?.toLowerCase()} unforgettable</div>
                      </div>
                    </div>
                    {occQ.map((q: any) => <DynField key={q.id} q={q} answers={form.occasion_answers} onChange={(k, v) => updNested('occasion_answers', k, v)} />)}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — TRIP TYPE */}
            {step === 3 && (
              <div className="fade-in">
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, color: C.text, marginBottom: 6 }}>What Kind of Journey?</h3>
                <p style={{ color: C.muted, fontSize: 15, marginBottom: 28 }}>Pick the type of trip you're dreaming about — this shapes everything we'll ask next.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
                  {TRIP_TYPES.map(t => (
                    <SelectionCard key={t.id} item={t} selected={form.trip_type === t.id} onSelect={() => upd('trip_type', t.id)} />
                  ))}
                </div>
                {tripQ.length > 0 && form.trip_type && (
                  <div className="fade-in" style={{ paddingTop: 28, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <span style={{ fontSize: 26 }}>{selectedTrip?.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color: C.teal, fontWeight: 700 }}>{selectedTrip?.label?.toUpperCase()} QUESTIONS</div>
                        <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>A few quick questions to personalize your trip</div>
                      </div>
                    </div>
                    {tripQ.map((q: any) => <DynField key={q.id} q={q} answers={form.trip_answers} onChange={(k, v) => updNested('trip_answers', k, v)} />)}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 — TRIP DETAILS */}
            {step === 4 && (
              <div className="fade-in">
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, color: C.text, marginBottom: 6 }}>Trip Details</h3>
                <p style={{ color: C.muted, fontSize: 15, marginBottom: 28 }}>Tell us the logistics so we can start building your perfect itinerary.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  <div style={{ marginBottom: 20 }}>
                    <Label>Dream Destination *</Label>
                    <input style={IS} type="text" placeholder="Where do you want to go?"
                      value={form.destination || ''} onChange={e => upd('destination', e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Label>Number of Travelers</Label>
                    <input style={IS} type="number" min="1"
                      value={form.group_size || ''} onChange={e => upd('group_size', e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Label>Departure Date *</Label>
                    <input style={IS} type="date" min={today}
                      value={form.travel_dates || ''} onChange={e => upd('travel_dates', e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Label>Return Date</Label>
                    <input style={IS} type="date" min={form.travel_dates || today}
                      value={form.return_date || ''} onChange={e => upd('return_date', e.target.value)} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Label>Budget Per Person</Label>
                  <select style={IS} value={form.budget} onChange={e => upd('budget', e.target.value)}>
                    <option value="">Select Budget Range</option>
                    {['Under $5,000', '$5,000 – $10,000', '$10,000 – $25,000', '$25,000 – $50,000', '$50,000+', 'Flexible — show me the best'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Label>Preferred Accommodation</Label>
                  <select style={IS} value={form.accommodation} onChange={e => upd('accommodation', e.target.value)}>
                    <option value="">Select Preference</option>
                    {['5-Star Luxury Hotel', 'Boutique Hotel', 'Private Villa', 'Overwater Bungalow', 'Luxury Safari Lodge', 'Chartered Yacht', 'All-Inclusive Resort', 'Best Available'].map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Label>Preferred Contact Method</Label>
                  <select style={IS} value={form.preferred_contact} onChange={e => upd('preferred_contact', e.target.value)}>
                    {['Email', 'Phone Call', 'WhatsApp', 'Text Message'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 5 — TRAVELER PROFILE */}
            {step === 5 && (
              <div className="fade-in">
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, color: C.text, marginBottom: 6 }}>Your Traveler Profile</h3>
                <p style={{ color: C.muted, fontSize: 15, marginBottom: 28 }}>This is where the magic happens. The more you share, the more personalized your trip will be.</p>
                {TRAVELER_QUESTIONS.map(q => <DynField key={q.id} q={q} answers={form.traveler_answers} onChange={(k, v) => updNested('traveler_answers', k, v)} />)}
                <div style={{ marginBottom: 20 }}>
                  <Label>Dietary Requirements / Allergies</Label>
                  <input style={IS} type="text" placeholder="Vegetarian, halal, gluten-free, nut allergy..."
                    value={form.traveler_answers['dietary'] || ''} onChange={e => updNested('traveler_answers', 'dietary', e.target.value)} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Label>Medical or Accessibility Needs</Label>
                  <input style={IS} type="text" placeholder="Anything we should plan around..."
                    value={form.traveler_answers['medical'] || ''} onChange={e => updNested('traveler_answers', 'medical', e.target.value)} />
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <textarea style={{ ...IS, resize: 'vertical' } as React.CSSProperties} rows={3}
                    placeholder="Anything else we should know..."
                    value={form.notes || ''} onChange={e => upd('notes', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 6 — REVIEW & SUBMIT */}
            {step === 6 && (
              <div className="fade-in">
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, color: C.text, marginBottom: 6 }}>Almost There!</h3>
                <p style={{ color: C.muted, fontSize: 15, marginBottom: 28 }}>Add your emergency contact and hit submit — we'll take it from here.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  {[
                    { id: 'emergency_name', label: 'Emergency Contact Name *', type: 'text' },
                    { id: 'emergency_relation', label: 'Relationship', type: 'text' },
                    { id: 'emergency_phone', label: 'Emergency Phone *', type: 'tel' },
                  ].map(f => (
                    <div key={f.id} style={{ marginBottom: 20 }}>
                      <Label>{f.label}</Label>
                      <input style={IS} type={f.type} value={form[f.id] || ''} onChange={e => upd(f.id, e.target.value)} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 20 }}>
                    <Label>How Did You Hear About Us?</Label>
                    <select style={IS} value={form.heard_from || ''} onChange={e => upd('heard_from', e.target.value)}>
                      <option value="">Select One</option>
                      {['Referral from a friend', 'Social Media', 'Google Search', 'Travel Magazine', 'Event or Show', 'Returning Client', 'Other'].map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                {/* Summary card */}
                <div style={{ background: C.sand, borderRadius: 12, padding: '28px 32px', border: `1px solid rgba(58,125,125,0.15)`, marginTop: 8 }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, color: C.teal, marginBottom: 20 }}>YOUR TRIP SUMMARY</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
                    {[
                      ['Traveler', `${form.first_name} ${form.last_name}`],
                      ['Email', form.email],
                      ['Trip Type', selectedTrip?.label || '—'],
                      ['Occasion', selectedOccasion?.label || '—'],
                      ['Destination', form.destination || '—'],
                      ['Departure', form.travel_dates || '—'],
                      ['Return', form.return_date || '—'],
                      ['Group Size', form.group_size],
                      ['Budget', form.budget || '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: C.muted, marginBottom: 3 }}>{String(k).toUpperCase()}</div>
                        <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {form.traveler_answers['dream_moment'] && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid rgba(58,125,125,0.15)` }}>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: C.muted, marginBottom: 8 }}>YOUR DREAM MOMENT</div>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: C.text, fontStyle: 'italic', lineHeight: 1.65 }}>"{form.traveler_answers['dream_moment']}"</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 28, borderTop: `1px solid ${C.border}` }}>
              {step > 1
                ? <button onClick={() => setStep(s => s - 1)} style={{ padding: '12px 32px', border: `2px solid ${C.border}`, background: 'transparent', color: C.muted, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, cursor: 'pointer', borderRadius: 6 }}>← BACK</button>
                : <div />
              }
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: C.muted, letterSpacing: 1 }}>Step {step} of {STEPS.length}</div>
              {step < STEPS.length
                ? <button onClick={() => canProceed() && setStep(s => s + 1)}
                    style={{ padding: '13px 44px', background: canProceed() ? C.teal : C.border, color: canProceed() ? 'white' : C.muted, border: 'none', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, cursor: canProceed() ? 'pointer' : 'not-allowed', borderRadius: 6, fontWeight: 700, transition: 'all 0.3s' }}>
                    CONTINUE →
                  </button>
                : <button onClick={handleSubmit} disabled={loading}
                    style={{ padding: '13px 52px', background: loading ? C.border : C.teal, color: 'white', border: 'none', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 6, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'SUBMITTING...' : 'SUBMIT & START PLANNING ✦'}
                  </button>
              }
            </div>
            <p style={{ marginTop: 18, fontSize: 12, color: C.muted, textAlign: 'center' }}>
              By submitting, you agree to our <a href="/privacy" style={{ color: C.teal }}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
