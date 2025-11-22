// src/seller/components/Step0_LiveLocation.jsx
import React, { useState, useRef, useEffect } from 'react';

const Step0_LiveLocation = ({ data, handleChange, handleNextStep }) => {
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [imgError, setImgError] = useState('');
  const [detectedAddress, setDetectedAddress] = useState(
    data.detectedAddress || ''
  );
  const [cameraOn, setCameraOn] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const hasLocation =
    data.liveLatitude != null && data.liveLongitude != null;
  const hasImage = !!data.liveImageDataUrl;
  const isStepValid = hasLocation && hasImage;

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      if (!res.ok) return;
      const json = await res.json();
      const addr = json.display_name || '';
      setDetectedAddress(addr);
      handleChange('detectedAddress', addr);
    } catch (e) {
      console.warn('Reverse geocode failed', e);
    }
  };

  const getLocationOnce = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation is not supported by your browser.';
        setLocError(msg);
        return reject(new Error(msg));
      }

      setLocLoading(true);
      setLocError('');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          handleChange('liveLatitude', latitude);
          handleChange('liveLongitude', longitude);
          setLocLoading(false);
          reverseGeocode(latitude, longitude);
          resolve();
        },
        (err) => {
          const msg = err.message || 'Failed to get location.';
          setLocError(msg);
          setLocLoading(false);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    });

  const handleGetLocationClick = async () => {
    try {
      await getLocationOnce();
    } catch {
      // error already set in state
    }
  };

  const startCamera = async () => {
    setImgError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setImgError('Camera access is not supported in this browser.');
      return;
    }

    try {
      // Stop old stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true, // generic – best for laptop/desktop
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        // Critical: make sure playback actually starts
        video.onloadedmetadata = () => {
          video
            .play()
            .catch((err) => {
              console.error('Video play error:', err);
              setImgError('Could not start camera preview.');
            });
        };
      }

      setCameraOn(true);
    } catch (err) {
      console.error(err);
      setImgError('Unable to access camera. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const handleCapturePhoto = async () => {
    setImgError('');

    // Make sure we have location as well
    if (!hasLocation) {
      try {
        await getLocationOnce();
      } catch {
        setImgError('Could not get location while capturing photo.');
        return;
      }
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setImgError('Camera not ready yet.');
      return;
    }

    // Use actual video size, with fallback so we don't break
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (!width || !height) {
      setImgError(
        'Camera feed is still starting. Wait a second and try capturing again.'
      );
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    handleChange('liveImageDataUrl', dataUrl);

    // After successful capture, stop camera
    stopCamera();
  };

  return (
    <div style={{ height: '100%' }}>
      <h2 className="form-title">Capture Live Location</h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        First, capture your exact location and a live photo of the property.
        This is for admin verification only and won&apos;t be shown to buyers.
      </p>

      {/* Location section */}
      <div className="input-field-group">
        <label style={{ fontSize: '1.1rem', fontWeight: '600' }}>
          Live Location
        </label>

        <button
          type="button"
          onClick={handleGetLocationClick}
          style={{
            marginTop: '0.75rem',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          disabled={locLoading}
        >
          {locLoading ? 'Detecting...' : 'Detect Current Location'}
        </button>

        {hasLocation && (
          <div
            style={{
              marginTop: '1rem',
              fontSize: '0.9rem',
              color: '#111827',
              backgroundColor: '#eff6ff',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
            }}
          >
            {detectedAddress ? (
              <>
                <div style={{ fontWeight: 600 }}>Detected address:</div>
                <div style={{ marginTop: '0.25rem' }}>{detectedAddress}</div>
              </>
            ) : (
              <>
                <div>Latitude: {data.liveLatitude}</div>
                <div>Longitude: {data.liveLongitude}</div>
              </>
            )}
          </div>
        )}

        {locError && (
          <p className="validation-error" style={{ marginTop: '0.5rem' }}>
            {locError}
          </p>
        )}
      </div>

      {/* Camera section */}
      <div className="input-field-group" style={{ marginTop: '1.5rem' }}>
        <label style={{ fontSize: '1.1rem', fontWeight: '600' }}>
          Live Property Photo
        </label>
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Use your camera to take a live photo of the property frontage.
        </p>

        {!cameraOn && (
          <button
            type="button"
            onClick={startCamera}
            style={{
              marginTop: '0.75rem',
              backgroundColor: '#4b5563',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Camera
          </button>
        )}

        {cameraOn && (
          <div
            style={{
              marginTop: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                maxHeight: '260px',
                borderRadius: '0.5rem',
                backgroundColor: '#000',
                objectFit: 'cover',
              }}
            ></video>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleCapturePhoto}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Capture Photo & Save
              </button>
              <button
                type="button"
                onClick={stopCamera}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {imgError && (
          <p className="validation-error" style={{ marginTop: '0.5rem' }}>
            {imgError}
          </p>
        )}

        {data.liveImageDataUrl && (
          <div style={{ marginTop: '1rem' }}>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#4b5563',
                marginBottom: '0.5rem',
              }}
            >
              Captured preview:
            </p>
            <img
              src={data.liveImageDataUrl}
              alt="Live capture"
              style={{
                maxWidth: '100%',
                maxHeight: '220px',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                objectFit: 'cover',
              }}
            />
          </div>
        )}
      </div>

      {/* Next */}
      <div style={{ marginTop: '3rem', textAlign: 'right' }}>
        <button
          style={{
            backgroundColor: isStepValid ? '#059669' : '#a7f3d0',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: 'bold',
            cursor: isStepValid ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
          onClick={isStepValid ? handleNextStep : null}
          disabled={!isStepValid}
        >
          Next, add basic details
        </button>
      </div>
    </div>
  );
};

export default Step0_LiveLocation;
