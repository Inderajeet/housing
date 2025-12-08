// src/pages/ProjectDetailsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaDotCircle } from 'react-icons/fa';

import GalleryMap from '../components/ProjectDetails/GalleryMap'; 
import '../styles/ProjectDetailsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housing-backend.vercel.app';

// --- BOOKING FLOW DEFINITIONS ---
const BOOKING_STAGES = {
    NOT_BOOKED: 'NOT_BOOKED',
    BOOKED: 'BOOKED',
    CONFIRMED: 'CONFIRMED',
    DEAL_FINALISED: 'DEAL_FINALISED',
    DEAL_BLOCKED: 'DEAL_BLOCKED', 
};

// --- Mock Booking Status API & DB (Simplified) ---
const MOCK_BOOKING_DB = {};
const MOCK_GENERAL_STATUS_DB = {
    // Example: Property 1 - totalBooked: 5, confirmedCount: 2, isFinalized: false 
    // (This scenario allows status check but blocks new booking progression)
    '1': { totalBooked: 5, confirmedCount: 2, isFinalized: false },
    // Example: Property 18782388 - Finalized (Input must be disabled)
    '18782388': { totalBooked: 1, confirmedCount: 1, isFinalized: true }, 
};

const fetchGeneralStatus = async (propertyId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_GENERAL_STATUS_DB[propertyId] || { totalBooked: 0, confirmedCount: 0, isFinalized: false };
};

const fetchBookingStatus = async (propertyId, userPhone) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const generalStatus = await fetchGeneralStatus(propertyId);

    const statusKey = `${propertyId}:${userPhone}`;
    const userStage = MOCK_BOOKING_DB[statusKey] || BOOKING_STAGES.NOT_BOOKED;
    
    // Check for blocking only if user's stage is NOT already finalized
    if (generalStatus.isFinalized && userStage !== BOOKING_STAGES.DEAL_FINALISED) {
        return { stage: BOOKING_STAGES.DEAL_BLOCKED, message: "This property deal has been finalized by another buyer." };
    }
    
    return { stage: userStage, message: '' };
};

// --- Shortlist Button Component ---
const ShortlistButton = ({ projectId }) => {
    const [isShortlisted, setIsShortlisted] = useState(() => {
        const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
        return list.includes(projectId);
    }); 

    const handleShortlistToggle = () => {
        const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
        let newList;

        if (isShortlisted) {
            newList = list.filter(id => id !== projectId);
        } else {
            newList = [...list, projectId];
        }

        localStorage.setItem('shortlist', JSON.stringify(newList));
        setIsShortlisted(!isShortlisted);
    };

    return (
        <button 
            className={`shortlist-icon-btn ${isShortlisted ? 'shortlisted' : ''}`}
            onClick={handleShortlistToggle}
            title={isShortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
        >
            {isShortlisted ? <FaHeart /> : <FaRegHeart />}
        </button>
    );
};

// --- Consolidated Booking Flow Manager ---
const BookingFlowManager = ({ propertyId, currentStage, onStageUpdate, isBlocked, generalStatus }) => {
    const [phone, setPhone] = useState('');
    const [isFlowLoading, setIsFlowLoading] = useState(false);
    const [flowError, setFlowError] = useState('');
    const [submitted, setSubmitted] = useState(false); 

    // General flow steps with stats (Used in general view)
    const flowStepsWithStats = useMemo(() => [
        { 
            key: BOOKING_STAGES.NOT_BOOKED, 
            title: '1. Contact Registration', 
            detail: "Provide contact details to start the process.", 
            minCount: 1, 
            stat: `(${generalStatus.totalBooked} Registered)`,
        },
        { 
            key: BOOKING_STAGES.BOOKED, 
            title: '2. Document Shared & Token Due', 
            detail: "Seller shares documents. Pay token amount to confirm.", 
            minCount: generalStatus.totalBooked, 
            stat: generalStatus.confirmedCount > 0 
                ? `(${generalStatus.confirmedCount} Confirmed - Potential Block)`
                : "(No Confirmed Buyers Yet)"
        },
        { 
            key: BOOKING_STAGES.CONFIRMED, 
            title: '3. Advance Payment Due', 
            detail: "Execute Pro-Sale MOU by paying the advance amount.",
            minCount: generalStatus.confirmedCount,
            stat: generalStatus.isFinalized 
                ? "(Deal Finalized)" 
                : "(Awaiting Finalization)" 
        },
        { 
            key: BOOKING_STAGES.DEAL_FINALISED, 
            title: '4. Deal Finalised', 
            detail: "Property registration pending." ,
            minCount: generalStatus.isFinalized ? 1 : 0,
            stat: ""
        },
    ], [generalStatus]);

    // Simple flow steps (Used in user view after submission)
    const simpleFlowSteps = useMemo(() => [
        { stage: BOOKING_STAGES.NOT_BOOKED, title: '1. Contact Registration', nextLabel: 'Book Property (Register Contact)', nextStage: BOOKING_STAGES.BOOKED, info: "Provide your contact to start the process." },
        { stage: BOOKING_STAGES.BOOKED, title: '2. Document Review & Token Payment', nextLabel: 'Confirm Booking (Pay Token Amount)', nextStage: BOOKING_STAGES.CONFIRMED, info: "We will share legal documents via WhatsApp. Review and confirm by paying a token amount (Refundable)." },
        { stage: BOOKING_STAGES.CONFIRMED, title: '3. Final Documentation & Advance', nextLabel: 'Finalize Deal (Pay Advance Amount)', nextStage: BOOKING_STAGES.DEAL_FINALISED, info: "After legal clearance, pay the advance amount to execute the Pro-Sale MOU." },
        { stage: BOOKING_STAGES.DEAL_FINALISED, title: '4. Deal Finalised', nextLabel: null, nextStage: null, info: "Deal finalized! Preparing for property registration." },
    ], []);


    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setFlowError('');
        if (!/^\d{10}$/.test(phone)) {
            setFlowError('Please enter a valid 10-digit phone number.');
            return;
        }
        setIsFlowLoading(true);
        setSubmitted(true); 

        const { stage, message } = await fetchBookingStatus(propertyId, phone);
        onStageUpdate(stage, phone, message);

        setIsFlowLoading(false);
    };

    const handleNextStep = (nextStage) => {
        
        // Block step progression if other buyers have confirmed, unless the user is already confirmed/finalized
        if (generalStatus.confirmedCount > 0 && nextStage === BOOKING_STAGES.BOOKED && currentStage === BOOKING_STAGES.NOT_BOOKED) {
            // New user trying to book when others are confirmed. 
            alert("This property is currently under token confirmation by other buyers. New registrations cannot proceed to booking at this time.");
            return;
        }
        if (generalStatus.isFinalized && nextStage !== BOOKING_STAGES.DEAL_FINALISED) {
            alert("Deal finalized. Cannot proceed.");
            return;
        }


        const statusKey = `${propertyId}:${phone}`;
        MOCK_BOOKING_DB[statusKey] = nextStage;
        
        // Mock updating general status
        if (nextStage === BOOKING_STAGES.BOOKED) {
            // Use a copy to prevent mutation issues with mock DB
            MOCK_GENERAL_STATUS_DB[propertyId] = { 
                ...(MOCK_GENERAL_STATUS_DB[propertyId] || { totalBooked: 0, confirmedCount: 0, isFinalized: false }), 
                totalBooked: generalStatus.totalBooked + 1 
            };
        } else if (nextStage === BOOKING_STAGES.CONFIRMED) {
             MOCK_GENERAL_STATUS_DB[propertyId] = { 
                ...(MOCK_GENERAL_STATUS_DB[propertyId] || { totalBooked: 0, confirmedCount: 0, isFinalized: false }), 
                confirmedCount: generalStatus.confirmedCount + 1 
            };
        } else if (nextStage === BOOKING_STAGES.DEAL_FINALISED) {
             // User finalized the deal: update both user stage and general status
             MOCK_GENERAL_STATUS_DB[propertyId] = { 
                ...(MOCK_GENERAL_STATUS_DB[propertyId] || { totalBooked: 0, confirmedCount: 0, isFinalized: false }), 
                isFinalized: true 
            };
        }

        onStageUpdate(nextStage, phone, ''); 
    };

    // --- RENDER FUNCTION 1: DETAILED TRACKER (For General View) ---
    const renderFlowTracker = useCallback(() => {
        
        // Define which steps are considered "completed" for the visual tracker
        const isStep1Completed = generalStatus.totalBooked > 0;
        const isStep2Completed = generalStatus.confirmedCount > 0;
        const isStep3Completed = generalStatus.isFinalized;

        return (
            <div className="tracker-bar">
                {flowStepsWithStats.map((step, index) => {
                    let isCompleted = false;
                    
                    if (index === 0) isCompleted = isStep1Completed;
                    if (index === 1) isCompleted = isStep2Completed;
                    if (index === 2) isCompleted = isStep3Completed;
                    if (index === 3) isCompleted = isStep3Completed; 

                    const stateClass = isCompleted ? 'completed' : 'pending';
                    const isFinal = index === flowStepsWithStats.length - 1;
                    
                    let statClass = '';
                    if (step.key === BOOKING_STAGES.BOOKED && generalStatus.confirmedCount > 0) {
                        statClass = 'stat-warning';
                    }
                    if (step.key === BOOKING_STAGES.CONFIRMED && generalStatus.isFinalized) {
                        statClass = 'stat-danger';
                    }

                    return (
                        <React.Fragment key={step.key}>
                            <div className={`tracker-step ${stateClass} general-step`}>
                                <div className="tracker-icon"><FaDotCircle /></div>
                                <div className="tracker-info">
                                    <h5>
                                        {step.title} 
                                        <span className={`tracker-stat ${statClass}`}>{step.stat}</span>
                                    </h5>
                                    <p>{step.detail}</p>
                                </div>
                            </div>
                            {!isFinal && <div className={`tracker-line general-line ${stateClass === 'completed' ? 'completed-line' : ''}`}></div>}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }, [flowStepsWithStats, generalStatus]);
    
    // --- RENDER FUNCTION 2: SIMPLE STEP LIST (For User View) ---
    const renderUserFlowSteps = () => {
        let currentFlowIndex = simpleFlowSteps.findIndex(s => s.stage === currentStage);
        if (currentFlowIndex === -1 && currentStage === BOOKING_STAGES.NOT_BOOKED) {
            currentFlowIndex = 0;
        }

        const stepsToDisplay = simpleFlowSteps.map((step, index) => {
            const isActive = index <= currentFlowIndex;
            const isCurrent = index === currentFlowIndex;
            
            // Check if progression should be blocked for this step
            const shouldBlockProgression = 
                // Block new registration to booking if others are confirmed
                (step.stage === BOOKING_STAGES.NOT_BOOKED && generalStatus.confirmedCount > 0) ||
                // Block any action if the deal is finalized by someone else
                (generalStatus.isFinalized && currentStage !== BOOKING_STAGES.DEAL_FINALISED);
            
            const buttonText = shouldBlockProgression 
                ? (generalStatus.isFinalized ? "Deal Finalized" : "Currently Blocked (Confirmed Buyer)")
                : step.nextLabel;

            return (
                <div key={step.stage} className={`flow-step ${isCurrent ? 'current' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                        <h4>{step.title}</h4>
                        <p>{step.info}</p>
                        {isCurrent && currentStage !== BOOKING_STAGES.DEAL_FINALISED && !isBlocked && step.nextStage && (
                            <button 
                                className="next-step-btn" 
                                onClick={() => handleNextStep(step.nextStage)}
                                disabled={shouldBlockProgression}
                            >
                                {buttonText}
                            </button>
                        )}
                        {/* Show permanent disabled message if blocked by others and not yet final step */}
                        {isCurrent && shouldBlockProgression && currentStage !== BOOKING_STAGES.DEAL_FINALISED && (
                             <button className="next-step-btn disabled-btn" disabled>
                                {buttonText}
                            </button>
                        )}
                    </div>
                </div>
            );
        });

        return <div className="booking-flow-stages">{stepsToDisplay}</div>;
    };

    // 🟢 FIX 1: Only disable the initial button if the deal is finalized.
    const isButtonDisabled = isFlowLoading || generalStatus.isFinalized;

    const buttonText = () => {
        if (isFlowLoading) return 'Checking...';
        if (generalStatus.isFinalized) return 'Deal Finalized - Cannot Book';
        return 'Check Status / Start Booking';
    };


    if (!submitted) {
        return (
            <div className="booking-initial-state">
                <form onSubmit={handlePhoneSubmit} className="phone-submit-form">
                    <h4>Check Your Booking Status</h4>
                    <p>Enter your phone number to check your personal stage or start a new booking.</p>
                    <div className="phone-group">
                        <span className="country-code">+91</span>
                        <input 
                            type="tel" 
                            name="phone" 
                            placeholder="Phone Number (10 digits)" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required 
                            maxLength="10"
                            // FIX: Only disable input if deal is finalized
                            disabled={isFlowLoading || generalStatus.isFinalized}
                        />
                    </div>
                    {/* FIX: Only disable button if deal is finalized */}
                    <button type="submit" className="contact-btn" disabled={isButtonDisabled}>
                        {buttonText()}
                    </button>
                    {flowError && <p className="flow-error">{flowError}</p>}
                </form>

                <div className="general-status-overview">
                    <h5>General Deal Availability Flow</h5>
                    {generalStatus.isFinalized && (
                        <p className="status-note status-danger">🚨 **Deal Finalized:** This property is unavailable as the final advance has been paid.</p>
                    )}
                    {/* 🟢 FIX 2: Show clear warning if confirmed bookings exist but allow status check */}
                    {!generalStatus.isFinalized && generalStatus.confirmedCount > 0 && (
                        <p className="status-note status-warning">⚠️ **High Competition:** {generalStatus.confirmedCount} buyer(s) have confirmed with a token. You can check your registration status, but new booking progression is paused.</p>
                    )}
                    {!generalStatus.isFinalized && generalStatus.confirmedCount === 0 && (
                        <p className="status-note status-available">✅ **Available:** You can start the booking process now.</p>
                    )}
                    {renderFlowTracker()} 
                </div>
            </div>
        );
    }

    // --- Flow Display after Phone Input (User Status View) ---
    return (
        <div className="flow-display user-status-view">
            <div className="user-status-header">
                <span className="user-phone-display">Your Tracking Status for: **+91 {phone}**</span>
                <button className="change-phone-btn" onClick={() => { setPhone(''); setSubmitted(false); onStageUpdate(BOOKING_STAGES.NOT_BOOKED, ''); }}>Change</button>
            </div>

            <h4 className="tracker-title">Your Deal Progress</h4>
            
            {/* Check if the user's current stage is NOT DEAL_FINALISED before showing the blocked message */}
            {isBlocked && currentStage !== BOOKING_STAGES.DEAL_FINALISED && (
                <div className="deal-blocked-message">
                    <p>🚨 **DEAL UNAVAILABLE:** This property is finalized by another party. Your process is stopped. You will be notified if the deal falls through.</p>
                </div>
            )}
            
            {currentStage === BOOKING_STAGES.DEAL_FINALISED && (
                 <div className="deal-finalized-message">
                    <p>🎉 **CONGRATULATIONS!** You have finalized the deal. Proceeding to property registration.</p>
                </div>
            )}

            
            {/* If the user has finalized their own deal, we still show their steps for history */}
            {!isBlocked && renderUserFlowSteps()} 
            {isBlocked && currentStage === BOOKING_STAGES.DEAL_FINALISED && renderUserFlowSteps()} 

            <div className="tracker-summary">
                 <p>Current Stage: <span className="current-stage-text">{simpleFlowSteps.find(s => s.stage === currentStage)?.title || 'Not Registered'}</span></p>
                 <p className="status-disclaimer">Admin team will contact you via WhatsApp with the next steps.</p>
            </div>
        </div>
    );
};


// ... (Rest of ProjectDetailsPage component and helper functions remain the same) ...
const ProjectDetailsPage = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingStage, setBookingStage] = useState(BOOKING_STAGES.NOT_BOOKED);
    const [isBlocked, setIsBlocked] = useState(false);
    const [generalStatus, setGeneralStatus] = useState({ totalBooked: 0, confirmedCount: 0, isFinalized: false });

    // Effect 1: Initial fetch of General Status
    useEffect(() => {
        if (id) {
            fetchGeneralStatus(id).then(status => {
                setGeneralStatus(status);
                if (status.isFinalized) {
                    setIsBlocked(true);
                }
            });
        }
    }, [id]);
    
    // Effect 2: Fetch project details
    useEffect(() => {
        // ... (fetchProjectDetails function remains the same) ...
        const fetchProjectDetails = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            
            try {
                const res = await fetch(`${API_BASE_URL}/api/properties`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json(); 
                const idStr = String(id);
                const found = Array.isArray(data)
                    ? data.find((p) => String(p.id) === idStr)
                    : null;
                if (!found) {
                    setError('Project not found');
                    setProject(null);
                } else {
                    const mappedProject = mapBackendPropertyToProject(found);
                    setProject(mappedProject);
                }
            } catch (err) {
                console.error('Could not fetch project details:', err);
                setError('Failed to load project details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);


    const handleBookingStageUpdate = (stage, phone, message) => {
        setBookingStage(stage);
        
        // Re-fetch general status to get the most current counts/finalized status
        fetchGeneralStatus(id).then(status => {
            setGeneralStatus(status);
            // Block if the general status is finalized AND the user is NOT the one who just finalized
            setIsBlocked(status.isFinalized && stage !== BOOKING_STAGES.DEAL_FINALISED);
        });
    };

    if (loading) {
        return <div className="details-container loading">Loading Project Details...</div>;
    }
    if (error) {
        return <div className="details-container error">{error}</div>;
    }
    if (!project) return null;

    const {
        id: projectId,
        title,
        district,
        images_detail,
        reraCertified,
        price,
        priceDetails,
        image,
        location,
        lookingTo 
    } = project;

    const isSale = !['Rent', 'PG/Co-living'].includes(lookingTo); 
    const startingPrice = computeStartingPrice(price, priceDetails);
    
    const detailImages =
        images_detail && images_detail.length >= 2
        ? images_detail
        : [
            image || 'https://via.placeholder.com/400x250?text=Interior+View+1',
            image || 'https://via.placeholder.com/400x250?text=Interior+View+2',
            ];

    const hasMapLocation =
        location &&
        typeof location.lat === 'number' &&
        typeof location.lng === 'number';
    
    const isTopSectionReady = hasMapLocation && isSale;


    return (
        <div className="project-details-page new-layout">
            <div className="detail-header-wrapper">
                <div className="breadcrumbs">
                    Home / {district || 'Location'} / {title}
                </div>
                <div className="project-title-bar">
                    <h1 className="project-title">{title}</h1>
                    <span className="project-price">{startingPrice} Onwards</span>
                    <ShortlistButton projectId={projectId} />
                </div>
            </div>

            {/* --- MAIN CONTAINER: TWO COLUMNS (Map/Gallery on Left, Booking on Right) --- */}
            <div className="main-content-flow-wrapper">
                
                {/* --- LEFT COLUMN: MAP & IMAGE GALLERY --- */}
                <div className="left-map-gallery-column">
                    
                    {/* Map/Street View */}
                    {isTopSectionReady && (
                        <div className="map-area">
                            <GalleryMap location={location} title={title} streetView={true} /> 
                            {reraCertified && <span className="rera-tag">RERA CERTIFIED</span>}
                        </div>
                    )}

                    {/* Image Gallery */}
                    <div className="image-gallery-section">
                        <h2>Property Images</h2>
                        <div className="image-gallery">
                            <div className="main-image">
                                <img
                                    src={detailImages[0]}
                                    alt={title}
                                />
                            </div>

                            <div className="side-images">
                                <img src={detailImages[1]} alt="Interior View 1" />
                                <img src={detailImages[2] || detailImages[0]} alt="Interior View 2" />
                                <button className="view-more-photos">+ More Photos</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: BOOKING FLOW (Stretched to fill height) --- */}
                <div className="right-booking-flow-column">
                    
                    <div className="booking-flow-area">
                        <BookingFlowManager 
                            propertyId={id} 
                            currentStage={bookingStage}
                            onStageUpdate={handleBookingStageUpdate}
                            isBlocked={isBlocked}
                            generalStatus={generalStatus}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Functions (Same as before) ---
function computeStartingPrice(price, priceDetails) {
    if (priceDetails && Object.keys(priceDetails).length > 0) {
        return Object.values(priceDetails)[0];
    }
    const num = Number(price);
    if (!Number.isFinite(num) || num <= 0) {
        return 'Price on request';
    }
    if (num >= 10000000) {
        return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
        return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
}

function mapBackendPropertyToProject(p) {
    return {
        id: p.id,
        title: p.title,
        district: p.district,
        price: p.price,
        location: p.location,
        image: p.image,
        lookingTo: p.lookingTo,
        developer: p.developer,
        reraCertified: p.reraCertified ?? false,
        priceDetails: p.priceDetails || {},
        images_detail: p.images_detail || [],
    };
}

export default ProjectDetailsPage;