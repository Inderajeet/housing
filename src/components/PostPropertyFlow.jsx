// src/components/PostPropertyFlow.jsx
import React, { useState, useCallback, useMemo } from 'react';
import "../styles/Modal.css"; 

// Import the specific form components for Step 3
import RentPropertyForm from './RentPropertyForm'; 
import SellPropertyForm from './SellPropertyForm'; 

// --- Flow Definitions (Common) ---
const STEPS = [
    { id: 1, name: 'Contact' },
    { id: 2, name: 'Location Proof' },
    { id: 3, name: 'Property Details' },
];

// Define weights for progress calculation (Adjusted for modularity)
const FIELD_WEIGHTS = {
    number: 10,
    latitude: 10,
    liveImage: 10,
    
    // Rent Fields
    rent_propertyType: 5, rent_bhk: 5, rent_rentAmount: 5, rent_advanceAmount: 5,

    // Sell Fields
    sell_propertyType: 5, sell_price: 10, sell_sNo: 5, sell_documents: 5, 
    
    // Common Location & Media
    district: 5, taluk: 5, village: 5, landmark: 5, mediaFiles: 15,
};

// Function to calculate overall progress percentage
const calculateProgress = (data) => {
    let score = 0;
    let maxScore = 0; // Calculated dynamically based on transaction type
    
    // Common Step 1 & 2
    if (data.number && data.number.length === 10) score += FIELD_WEIGHTS.number;
    if (data.latitude) score += FIELD_WEIGHTS.latitude;
    if (data.liveImage) score += FIELD_WEIGHTS.liveImage;
    if (data.district) score += FIELD_WEIGHTS.district;
    if (data.taluk) score += FIELD_WEIGHTS.taluk;
    if (data.village) score += FIELD_WEIGHTS.village;
    if (data.landmark) score += FIELD_WEIGHTS.landmark;
    if (data.mediaFiles && data.mediaFiles.length > 0) score += FIELD_WEIGHTS.mediaFiles;

    // Transaction-specific fields
    if (data.transactionType === 'rent') {
        if (data.propertyType) score += FIELD_WEIGHTS.rent_propertyType;
        if (data.propertyType === 'Residential' && data.bhk) score += FIELD_WEIGHTS.rent_bhk;
        if (data.rentAmount) score += FIELD_WEIGHTS.rent_rentAmount;
        if (data.advanceAmount) score += FIELD_WEIGHTS.rent_advanceAmount;
        maxScore = FIELD_WEIGHTS.number + FIELD_WEIGHTS.latitude + FIELD_WEIGHTS.liveImage + FIELD_WEIGHTS.rent_propertyType + FIELD_WEIGHTS.rent_bhk + FIELD_WEIGHTS.rent_rentAmount + FIELD_WEIGHTS.rent_advanceAmount + FIELD_WEIGHTS.district + FIELD_WEIGHTS.taluk + FIELD_WEIGHTS.village + FIELD_WEIGHTS.landmark + FIELD_WEIGHTS.mediaFiles;
    } else if (data.transactionType === 'sell') {
        if (data.sellType) score += FIELD_WEIGHTS.sell_propertyType;
        if (data.price) score += FIELD_WEIGHTS.sell_price;
        if (data.sNo) score += FIELD_WEIGHTS.sell_sNo;
        // Check if any of the document fields are populated
        if (data.allDocuments.length > 0 || data.drawings.length > 0 || data.brochure.length > 0) score += FIELD_WEIGHTS.sell_documents;
        maxScore = FIELD_WEIGHTS.number + FIELD_WEIGHTS.latitude + FIELD_WEIGHTS.liveImage + FIELD_WEIGHTS.sell_propertyType + FIELD_WEIGHTS.sell_price + FIELD_WEIGHTS.sell_sNo + FIELD_WEIGHTS.sell_documents + FIELD_WEIGHTS.district + FIELD_WEIGHTS.taluk + FIELD_WEIGHTS.village + FIELD_WEIGHTS.landmark + FIELD_WEIGHTS.mediaFiles;
    }

    // Default max score if calculation fails or transaction type is missing (shouldn't happen)
    if (maxScore === 0) maxScore = 100;

    return Math.min(100, Math.round((score / maxScore) * 100));
};

// --- Progress Bar Component (Reused) ---
const ProgressBar = ({ currentStep }) => {
    const totalSteps = STEPS.length;
    const currentStepIndex = currentStep - 1;
    const stepWidth = (currentStepIndex / (totalSteps - 1)) * 100 || 0;
    
    return (
        <div className="progress-bar-container">
            <div className="step-indicators"> 
                <div className="progress-bar-line">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${stepWidth}%` }}
                    ></div>
                </div>

                {STEPS.map((step, index) => (
                    <div 
                        key={step.id} 
                        className={`step-dot ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- STEP 1: Number Capture Modal (Reused) ---
const NumberCaptureModal = ({ data, onChange, onNext }) => {
    return (
        <div className="modal-content">
            <h2>1. Contact Details</h2> 
            <p>Please share your number to get started. It will not be visible to the public.</p>
            <div className="form-group">
                <label>Mobile Number</label>
                <input
                    type="tel"
                    placeholder="Enter 10 digit Mobile Number"
                    value={data.number}
                    onChange={(e) => onChange('number', e.target.value)}
                    maxLength={10}
                    className="input-field"
                />
            </div>
            <div className="modal-actions full-width-center">
                <button 
                    onClick={onNext} 
                    disabled={data.number.length !== 10}
                    className="primary-button"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

// --- STEP 2: Live Location Modal (Reused) ---
const LiveLocationModal = ({ data, onChange, onNext }) => {
    const videoRef = React.useRef(null);
    const [stream, setStream] = useState(null);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onChange('latitude', latitude.toFixed(6));
                onChange('longitude', longitude.toFixed(6));
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Could not get live location. Please ensure location services are enabled.");
            }
        );
    };

    const handleCameraCapture = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera access is not supported by this browser/device.");
            return;
        }
        
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(videoStream);
            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Camera access denied or failed. Please ensure permissions are granted.");
            return;
        }
    };
    
    const handleTakePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            
            // Stop camera stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            
            // Store proof of capture
            onChange('liveImage', imageDataUrl.substring(0, 50) + '...'); 
            
        } else {
            alert("Camera not ready. Please try again.");
        }
    };

    const isLocationCaptured = data.latitude && data.longitude;
    const isPhotoCaptured = data.liveImage;
    const isReadyToProceed = isLocationCaptured && isPhotoCaptured;
    
    // Cleanup stream on unmount
    React.useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="modal-content">
            <h2>2. Location Proof</h2> 
            <p>Capturing your **live location** and a **photo** is necessary to verify the property and gives buyers confidence. You must perform both steps.</p>
            
            <div className="live-location-area">
                
                <button 
                    onClick={handleGetLocation} 
                    className={`secondary-button capture-btn ${isLocationCaptured ? 'captured' : ''}`}
                >
                    {isLocationCaptured ? '✅ Location Captured' : '📍 Capture Live Location'}
                </button>
                
                {stream && (
                    <div className="camera-view">
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 'auto', borderRadius: '8px' }}></video>
                        <button onClick={handleTakePhoto} className="primary-button take-photo-btn">
                            📸 Take Photo
                        </button>
                    </div>
                )}
                
                {!stream && (
                    <button 
                        onClick={handleCameraCapture} 
                        className={`secondary-button capture-btn ${isPhotoCaptured ? 'captured' : ''}`}
                    >
                        {isPhotoCaptured ? '✅ Photo Captured (Retake)' : '📷 Open Camera & Take Photo'}
                    </button>
                )}

                <div className="captured-details-group">
                    {isLocationCaptured && (
                        <div className="captured-details location-info">
                            Location: Lat **{data.latitude}**, Lon **{data.longitude}**
                        </div>
                    )}
                    {isPhotoCaptured && (
                        <div className="captured-details photo-info">
                            Photo Status: Image Data Captured
                        </div>
                    )}
                </div>
            </div>

            <div className="modal-actions full-width-center">
                <button 
                    onClick={onNext} 
                    className="primary-button"
                    disabled={!isReadyToProceed} 
                >
                    Continue
                </button>
            </div>
        </div>
    );
};


// --- Initial State Definition ---
const initialFormData = {
    number: '',
    latitude: '',
    longitude: '',
    liveImage: '', 
    transactionType: 'rent', // Default to rent, overridden by prop

    // Rent Fields
    propertyType: 'Residential', 
    bhk: '', 
    rentAmount: '',
    advanceAmount: '',

    // Sell Fields
    sellType: '', 
    price: '',
    sNo: '', 
    allDocuments: [], 
    drawings: [],
    brochure: [],

    // Common Location & Media
    district: '',
    taluk: '',
    village: '',
    landmark: '',
    mediaFiles: [], 
};

// --- MAIN FLOW COMPONENT ---
const PostPropertyFlow = ({ onClose, initialTransactionType = 'rent', onSuccessfulPost }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(() => ({ 
        ...initialFormData, 
        transactionType: initialTransactionType.toLowerCase() === 'sell' ? 'sell' : 'rent' 
    }));
    
    // Calculate progress 
    const progressPercent = useMemo(() => calculateProgress(formData), [formData]);

    const handleDataChange = useCallback((key, value) => {
        setFormData(prev => {
            let newState = { ...prev, [key]: value };
            
            // Logic to clear dependent fields on location change
            if (key === 'district') newState = { ...newState, taluk: '', village: '' };
            if (key === 'taluk') newState = { ...newState, village: '' };
            
            return newState;
        });
    }, []);
    
    const handleNext = useCallback(() => {
        setCurrentStep(prev => prev < STEPS.length ? prev + 1 : prev);
    }, []);

    const handleSubmit = useCallback(() => {
        
        console.log(`Submitting Property for ${formData.transactionType}:`, formData);
        
        // Final action upon successful form completion
        if (onSuccessfulPost) {
            onSuccessfulPost(formData.number);
        } else {
            onClose();
        }
        
    }, [formData, onSuccessfulPost, onClose]); 
    
    // --- Render Current Step ---
    let StepComponent;
    
    switch (currentStep) {
        case 1:
            StepComponent = (
                <NumberCaptureModal
                    data={formData}
                    onChange={handleDataChange}
                    onNext={handleNext}
                />
            );
            break;
        case 2:
            StepComponent = (
                <LiveLocationModal
                    data={formData}
                    onChange={handleDataChange}
                    onNext={handleNext}
                />
            );
            break;
        case 3:
            if (formData.transactionType === 'rent') {
                 StepComponent = (
                    <RentPropertyForm
                        data={formData}
                        onChange={handleDataChange}
                        onSubmit={handleSubmit}
                    />
                );
            } else {
                 StepComponent = (
                    <SellPropertyForm
                        data={formData}
                        onChange={handleDataChange}
                        onSubmit={handleSubmit}
                    />
                );
            }
            break;
        default:
            StepComponent = null;
    }

    return (
        <div className="modal-overlay">
            <div className="post-property-modal">
                <div className="modal-header">
                    <ProgressBar currentStep={currentStep} />
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>
                {StepComponent}
                 {/* <div className="flow-progress-footer">
                    Completion: **{progressPercent}%**
                </div> */}
            </div>
        </div>
    );
};

export default PostPropertyFlow;