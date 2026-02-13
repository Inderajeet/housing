import React, { useState, useRef, useEffect } from 'react';

const LiveLocationModal = ({ data, onChange, onNext }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Start the camera and attach to video element
    const handleStartCamera = async () => {
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, 
                audio: false 
            });
            
            setStream(videoStream);
            setIsCameraActive(true);

            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
                // Important: explicitly call play
                await videoRef.current.play();
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const handleCapture = async () => {
        const video = videoRef.current;
        
        if (!video || !stream) {
            alert("Camera not initialized.");
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Get GPS (Runs in background)
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    onChange('latitude', pos.coords.latitude.toFixed(6));
                    onChange('longitude', pos.coords.longitude.toFixed(6));
                },
                (err) => console.warn("GPS failed"),
                { enableHighAccuracy: true }
            );

            // 2. Capture Photo
            const canvas = document.createElement('canvas');
            // Use actual video dimensions
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = canvas.toDataURL('image/jpeg', 0.7);
            onChange('liveImage', imageData);

            // 3. Stop everything and hide camera
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraActive(false);

        } catch (err) {
            console.error("Capture failed", err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [stream]);

    const isReady = data.latitude && data.longitude && data.liveImage;

    return (
        <div className="modal-content">
            <h2>Location Proof</h2>
            <p>Please capture a live photo of the property and your location.</p>

            <div className="live-location-area">
                
                {/* Always keep video in DOM, just hide it when not active */}
                <div style={{ display: isCameraActive ? 'block' : 'none', marginBottom: '15px' }}>
                    <video 
                        ref={videoRef} 
                        playsInline 
                        muted 
                        style={{ width: '100%', borderRadius: '8px', background: '#000' }}
                    />
                    <button
                        type="button"
                        onClick={handleCapture}
                        disabled={isProcessing}
                        className="primary-button take-photo-btn"
                        style={{ marginTop: '10px', width: '100%' }}
                    >
                        {isProcessing ? 'Processing...' : '📸 Snap Photo & Location'}
                    </button>
                </div>

                {!isCameraActive && (
                    <button
                        type="button"
                        onClick={handleStartCamera}
                        className={`secondary-button capture-btn ${isReady ? 'captured' : ''}`}
                    >
                        {isReady ? '✅ Captured (Retake)' : '📷 Capture Live Photo'}
                    </button>
                )}

                {/* Preview and Status */}
                <div className="captured-details-group" style={{ marginTop: '15px' }}>
                    {isReady && !isCameraActive && (
                        <div style={{ marginBottom: '10px' }}>
                            <img 
                                src={data.liveImage} 
                                alt="Captured" 
                                style={{ width: '120px', borderRadius: '8px', border: '1px solid #ccc' }} 
                            />
                        </div>
                    )}
                    {data.latitude && (
                        <div className="captured-details">
                            📍 <b>Location:</b> {data.latitude}, {data.longitude}
                        </div>
                    )}
                </div>
            </div>

            <div className="modal-actions full-width-center">
                <button
                    type="button"
                    onClick={onNext}
                    className="primary-button"
                    disabled={!isReady || isCameraActive}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default LiveLocationModal;