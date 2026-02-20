import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fetchDeals from '../utils/fetchDeals';

const CACHE_KEY = 'fhj_deals_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 2; // 2 minutes

const PromotionsGrid = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      // Try sessionStorage cache first
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.ts && Date.now() - parsed.ts < CACHE_TTL_MS && Array.isArray(parsed.deals)) {
            setDeals(parsed.deals);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Ignore cache parse errors
        console.debug('deals cache parse error', e);
      }

      try {
        // fetchDeals uses global fetch; we provide a signal for cancellation
        const promise = fetchDeals({ signal: controller.signal });
        // If fetchDeals doesn't accept signal, it will still work — that's fine.
        const result = await promise;

        if (cancelled) return;
        if (!Array.isArray(result)) {
          setDeals([]);
        } else {
          setDeals(result);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), deals: result }));
          } catch (e) {
            // Ignore storage quota errors
            console.debug('deals cache write error', e);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.debug('deals fetch aborted');
        } else {
          console.error('Failed to load deals', err);
          setDeals([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // IMAGE HELPER — handles both flat Supabase and nested .fields format (fallback)
  const getImageUrl = (deal) => {
    const f = deal.fields || deal;
    return (
      f['Place Image URL'] || f.place_image_url ||
      f['Image URL'] || f.image_url ||
      f.image || f.photo || deal.image ||
      'https://images.unsplash.com/photo-1548574505-5e239809ee19'
    );
  };

  // FIELD HELPER — get field value from flat or nested
  const getField = (deal, ...keys) => {
    const f = deal.fields || deal;
    for (const k of keys) {
      if (f[k] !== undefined && f[k] !== null && f[k] !== '') return f[k];
    }
    return null;
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>

      {/* Background */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%', zIndex: -1,
        backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2560&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(60%)'
      }} />

      {/* HERO CONTENT */}
      <div style={{ paddingTop: '160px', textAlign: 'center', color: 'white', paddingBottom: '60px' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: '900', letterSpacing: '-2px', margin: 0 }}>
          TRAVEL <span style={{ color: '#4ade80' }}>BEYOND</span>
        </h1>
        <p style={{ fontSize: '1.4rem', opacity: 0.9, marginTop: '10px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          Exotic destinations curated by FHJ
        </p>
      </div>

      {/* DEAL GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        padding: '0 5% 100px 5%',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center', fontSize: '1.5rem', gridColumn: '1/-1' }}>Loading Experiences...</p>
        ) : deals.length > 0 ? (
          deals.map(deal => {
            const title = getField(deal, 'Trip Name', 'trip_name', 'Deal Name', 'title', 'name') || deal.title || 'Exclusive Experience';
            const price = getField(deal, 'Price', 'price', 'Amount', 'amount') ?? deal.price;

            return (
              <div key={deal.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                borderRadius: '30px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                transition: 'transform 0.3s ease'
              }}>

                {/* DEAL IMAGE */}
                <div style={{ height: '280px', overflow: 'hidden' }}>
                  <img
                    src={getImageUrl(deal)}
                    alt={title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      try { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1548574505-5e239809ee19'; } catch (err) { /* ignore */ }
                    }}
                  />
                </div>

                {/* Text Layer */}
                <div style={{ padding: '30px' }}>
                  <h3 style={{ fontSize: '1.6rem', color: 'white', marginBottom: '10px', fontWeight: 'bold' }}>
                    {title}
                  </h3>

                  {(() => {
                    const notes = getField(deal, 'Notes', 'notes', 'Description', 'description') || deal.notes;
                    return notes ? (
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {notes}
                      </p>
                    ) : null;
                  })()}

                  <p style={{ color: '#4ade80', fontSize: '1.4rem', fontWeight: '800', margin: '15px 0' }}>
                    {price ? `$${Number(price).toLocaleString()}` : 'Exclusive'}
                  </p>

                  <Link to={`/deals/${deal.id}`} style={{ textDecoration: 'none' }}>
                    <button style={{
                      width: '100%', padding: '16px', background: '#4ade80', color: '#0f172a',
                      border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer',
                      fontSize: '1rem', letterSpacing: '1px', transition: 'all 0.2s',
                      textTransform: 'uppercase'
                    }}>
                      Book This Destination
                    </button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'white', padding: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
            <h3>New curated experiences arriving shortly.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsGrid;