import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PremiumProperites.css';

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
  initialIndex = 0
}) => {
  const navigate = useNavigate();

  const adProperties = useMemo(
    () => properties.filter((p) => !!getPrimaryImage(p)),
    [properties]
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);

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
    if (adProperties.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % adProperties.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [adProperties.length, intervalMs]);

  if (adProperties.length === 0) return null;

  const safeIndex = activeIndex >= 0 && activeIndex < adProperties.length ? activeIndex : 0;
  const activeProperty = adProperties[safeIndex];
  if (!activeProperty) return null;

  const imageUrl = getPrimaryImage(activeProperty);
  if (!imageUrl) return null;

  const prevAd = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + adProperties.length) % adProperties.length);
  };

  const nextAd = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % adProperties.length);
  };

  return (
    <div
      className={`premium-ads-floating premium-ads-${position}`}
      onClick={() =>
        activeProperty.property_id &&
        navigate(`/property/${activeProperty.property_id}`, {
          state: { propertyData: activeProperty }
        })
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
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
        alt={activeProperty.formatted_id || activeProperty.title || 'Property Ad'}
        className="premium-ads-image"
      />

      {adProperties.length > 1 && (
        <>
          <button type="button" className="premium-ads-nav prev" onClick={prevAd} aria-label="Previous sponsored property">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" className="premium-ads-nav next" onClick={nextAd} aria-label="Next sponsored property">
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
