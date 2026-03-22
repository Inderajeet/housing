import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PremiumProperites.css';

const MOBILE_BREAKPOINT = 768;
const mobileAdAssetModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const createMobileAdImage = (slotNumber) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b3c5d" />
          <stop offset="55%" stop-color="#1d6f8c" />
          <stop offset="100%" stop-color="#f3c969" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <rect x="54" y="54" width="1092" height="692" rx="36" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.38)" stroke-width="6" />
      <text x="90" y="160" fill="#ffffff" font-size="70" font-family="Arial, sans-serif" font-weight="700">PREMIUM PROPERTY</text>
      <text x="90" y="238" fill="#ffffff" font-size="44" font-family="Arial, sans-serif">Mobile Sponsor Creative ${slotNumber}</text>
      <text x="90" y="330" fill="#fef3c7" font-size="30" font-family="Arial, sans-serif">Replace with screenshot artwork later if needed</text>
      <circle cx="980" cy="204" r="126" fill="rgba(255,255,255,0.18)" />
      <text x="980" y="230" text-anchor="middle" fill="#ffffff" font-size="140" font-family="Arial, sans-serif" font-weight="700">${slotNumber}</text>
      <rect x="90" y="460" width="340" height="120" rx="24" fill="rgba(8,22,34,0.32)" />
      <text x="126" y="534" fill="#ffffff" font-size="42" font-family="Arial, sans-serif" font-weight="700">Call Now</text>
      <rect x="448" y="460" width="662" height="120" rx="24" fill="rgba(255,255,255,0.18)" />
      <text x="490" y="534" fill="#ffffff" font-size="38" font-family="Arial, sans-serif">Visible on mobile only</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const MOBILE_STATIC_ADS = Array.from({ length: 6 }, (_, index) => {
  const slotNumber = index + 1;
  const assetPath = Object.keys(mobileAdAssetModules).find((path) =>
    path.endsWith(`/${slotNumber}.png`) ||
    path.endsWith(`/${slotNumber}.jpg`) ||
    path.endsWith(`/${slotNumber}.jpeg`) ||
    path.endsWith(`/${slotNumber}.webp`) ||
    path.endsWith(`/${slotNumber}.avif`)
  );

  return assetPath ? mobileAdAssetModules[assetPath] : createMobileAdImage(slotNumber);
});

const getPrimaryImage = (property) => {
  const images = Array.isArray(property?.images) ? property.images : [];
  if (images.length === 0) return null;
  const first = images[0];
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && first?.url) return first.url;
  return null;
};

const PremiumProperties = ({
  properties = [],
  intervalMs = 3500,
  position = 'bottom',
  initialIndex = 0,
  layout = 'floating',
  className = '',
  mobileAdIndex
}) => {
  const navigate = useNavigate();

  const adProperties = useMemo(
    () => properties.filter((p) => !!getPrimaryImage(p)),
    [properties]
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handleViewportChange = (event) => setIsMobileView(event.matches);

    setIsMobileView(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    if (adProperties.length === 0) return;
    setActiveIndex(initialIndex % adProperties.length);
  }, [initialIndex, adProperties.length]);

  useEffect(() => {
    if (activeIndex >= adProperties.length) {
      setActiveIndex(0);
    }
  }, [adProperties.length, activeIndex]);

  useEffect(() => {
    if (isMobileView) return undefined;
    if (adProperties.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % adProperties.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [adProperties.length, intervalMs, isMobileView]);

  if (adProperties.length === 0) return null;

  const safeIndex = activeIndex >= 0 && activeIndex < adProperties.length ? activeIndex : 0;
  const activeProperty = adProperties[safeIndex];
  if (!activeProperty) return null;

  const fallbackMobileIndex = ((mobileAdIndex ?? initialIndex) % MOBILE_STATIC_ADS.length + MOBILE_STATIC_ADS.length) % MOBILE_STATIC_ADS.length;
  const imageUrl = isMobileView ? MOBILE_STATIC_ADS[fallbackMobileIndex] : getPrimaryImage(activeProperty);
  if (!imageUrl) return null;

  const isInteractive = !isMobileView && !!activeProperty.property_id;

  const prevAd = (e) => {
    e.stopPropagation();
    if (isMobileView) return;
    setActiveIndex((prev) => (prev - 1 + adProperties.length) % adProperties.length);
  };

  const nextAd = (e) => {
    e.stopPropagation();
    if (isMobileView) return;
    setActiveIndex((prev) => (prev + 1) % adProperties.length);
  };

  const layoutClass =
    layout === 'menu'
      ? 'premium-ads-menu'
      : layout === 'landing'
        ? 'premium-ads-landing'
        : '';

  return (
    <div
      className={`premium-ads-floating premium-ads-${position} ${layoutClass} ${className}`.trim()}
      onClick={() =>
        isInteractive &&
        navigate(`/property/${activeProperty.property_id}`, {
          state: { propertyData: activeProperty }
        })
      }
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : -1}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (activeProperty.property_id) {
            navigate(`/property/${activeProperty.property_id}`, {
              state: { propertyData: activeProperty }
            });
          }
        }
      }}
    >
      <div className="premium-ads-label">Sponsored</div>
      <img
        src={imageUrl}
        alt={
          isMobileView
            ? `Sponsored mobile ad ${fallbackMobileIndex + 1}`
            : activeProperty.formatted_id || activeProperty.title || 'Property Ad'
        }
        className="premium-ads-image"
      />

      {(adProperties.length > 1 || isMobileView) && (
        <>
          <button
            type="button"
            className="premium-ads-nav prev"
            onClick={prevAd}
            aria-label="Previous sponsored property"
            disabled={isMobileView}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="premium-ads-nav next"
            onClick={nextAd}
            aria-label="Next sponsored property"
            disabled={isMobileView}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default PremiumProperties;
