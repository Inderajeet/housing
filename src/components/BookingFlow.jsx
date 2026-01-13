// src/components/BookingFlow.jsx

import React, { useState, useMemo, useCallback } from 'react';
import { FaHeart, FaRegHeart, FaDotCircle, FaArrowLeft } from 'react-icons/fa';

// --- BOOKING FLOW DEFINITIONS ---
const BOOKING_STAGES = {
    NOT_BOOKED: 'NOT_BOOKED',
    CONTACT_REGISTERED: 'CONTACT_REGISTERED', // Renamed from NOT_BOOKED to clarify initial state
    BOOKED: 'BOOKED',
    CONFIRMED: 'CONFIRMED',
    DEAL_FINALISED: 'DEAL_FINALISED',
    DEAL_BLOCKED: 'DEAL_BLOCKED',
};

// --- Mock Booking Status API & DB (Simplified) ---
// NOTE: These mock DBs should ideally live outside the component 
// or be replaced by actual API calls. Keeping them local for demonstration.
const MOCK_BOOKING_DB = {};
const MOCK_GENERAL_STATUS_DB = {
    '1': { totalBooked: 5, confirmedCount: 2, isFinalized: false },
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
    const userStage = MOCK_BOOKING_DB[statusKey] || BOOKING_STAGES.CONTACT_REGISTERED;

    if (generalStatus.isFinalized && userStage !== BOOKING_STAGES.DEAL_FINALISED) {
        return { stage: BOOKING_STAGES.DEAL_BLOCKED, message: "This property deal has been finalized by another buyer." };
    }

    return { stage: userStage, message: '' };
};

// --- Consolidated Booking Flow Component ---
const BookingFlow = ({ propertyId, generalStatus, onStageUpdate, isBlocked }) => {
    const [phone, setPhone] = useState('');
    const [currentStage, setCurrentStage] = useState(BOOKING_STAGES.CONTACT_REGISTERED);
    const [isFlowLoading, setIsFlowLoading] = useState(false);
    const [flowError, setFlowError] = useState('');
    const [submitted, setSubmitted] = useState(false); // True after phone submission

    // Internal state to manage the visual step progression in the user view
    const [userStepIndex, setUserStepIndex] = useState(0);

    // General flow steps with stats (Used in general view) - STEP NUMBERS REMOVED
    const flowStepsWithStats = useMemo(() => [
        {
            key: BOOKING_STAGES.CONTACT_REGISTERED,
            title: 'Contact Registration',
            detail: "Provide contact details to start the process.",
            stat: `(${generalStatus.totalBooked} Registered)`,
        },
        {
            key: BOOKING_STAGES.BOOKED,
            title: 'Document Shared & Token Due',
            detail: "Seller shares documents. Pay token amount to confirm.",
            stat: generalStatus.confirmedCount > 0
                ? `(${generalStatus.confirmedCount} Confirmed - Potential Block)`
                : "(No Confirmed Buyers Yet)"
        },
        {
            key: BOOKING_STAGES.CONFIRMED,
            title: 'Advance Payment Due',
            detail: "Execute Pro-Sale MOU by paying the advance amount.",
            stat: generalStatus.isFinalized
                ? "(Deal Finalized)"
                : "(Awaiting Finalization)"
        },
        {
            key: BOOKING_STAGES.DEAL_FINALISED,
            title: 'Deal Finalised',
            detail: "Property registration pending.",
            stat: ""
        },
    ], [generalStatus]);

    // Simple flow steps (Used in user view after submission) - STEP NUMBERS REMOVED
    const simpleFlowSteps = useMemo(() => [
        { stage: BOOKING_STAGES.CONTACT_REGISTERED, title: 'Contact Registration', nextLabel: 'Book Property (Register Contact)', nextStage: BOOKING_STAGES.BOOKED, info: "Provide your contact to start the process." },
        { stage: BOOKING_STAGES.BOOKED, title: 'Document Review & Token Payment', nextLabel: 'Confirm Booking (Pay Token Amount)', nextStage: BOOKING_STAGES.CONFIRMED, info: "We will share legal documents via WhatsApp. Review and confirm by paying a token amount (Refundable)." },
        { stage: BOOKING_STAGES.CONFIRMED, title: 'Final Documentation & Advance', nextLabel: 'Finalize Deal (Pay Advance Amount)', nextStage: BOOKING_STAGES.DEAL_FINALISED, info: "After legal clearance, pay the advance amount to execute the Pro-Sale MOU." },
        { stage: BOOKING_STAGES.DEAL_FINALISED, title: 'Deal Finalised', nextLabel: null, nextStage: null, info: "Deal finalized! Preparing for property registration." },
    ], []);


    // --- Logic for Initial Phone Submission ---
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

        // Find the index of the fetched stage
        const fetchedIndex = simpleFlowSteps.findIndex(s => s.stage === stage);
        setUserStepIndex(fetchedIndex !== -1 ? fetchedIndex : 0);
        setCurrentStage(stage);
        onStageUpdate(stage, phone, message); // Update parent (ProjectDetailsPage)

        setIsFlowLoading(false);
    };

    // --- Logic for Step Progression (Next Button) ---
    const handleNextStep = (nextStage) => {

        // 1. Block Progression Checks
        if (generalStatus.confirmedCount > 0 && nextStage === BOOKING_STAGES.BOOKED && currentStage === BOOKING_STAGES.CONTACT_REGISTERED) {
            alert("This property is currently under token confirmation by other buyers. New registrations cannot proceed to booking at this time.");
            return;
        }
        if (generalStatus.isFinalized && nextStage !== BOOKING_STAGES.DEAL_FINALISED) {
            alert("Deal finalized. Cannot proceed.");
            return;
        }


        // 2. Update Mock DB / API (Simulated)
        const statusKey = `${propertyId}:${phone}`;
        MOCK_BOOKING_DB[statusKey] = nextStage;

        // Mock updating general status (Should be in API layer)
        if (nextStage === BOOKING_STAGES.BOOKED) {
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

        // 3. Update component state and parent
        setCurrentStage(nextStage);
        setUserStepIndex(prev => prev + 1);
        onStageUpdate(nextStage, phone, '');
    };

    // --- Logic for Step Back Navigation ---
    const handleStepBack = () => {
        if (userStepIndex > 0) {
            const prevIndex = userStepIndex - 1;
            const prevStage = simpleFlowSteps[prevIndex].stage;
            setUserStepIndex(prevIndex);
            setCurrentStage(prevStage);
        }
    };


    // --- RENDER FUNCTION 1: DETAILED TRACKER (For General View) ---
    const renderFlowTracker = useCallback(() => {

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

        const currentStep = simpleFlowSteps[userStepIndex];
        if (!currentStep) return null; // Should not happen

        const shouldBlockProgression =
            (currentStep.stage === BOOKING_STAGES.CONTACT_REGISTERED && generalStatus.confirmedCount > 0) ||
            (generalStatus.isFinalized && currentStep.stage !== BOOKING_STAGES.DEAL_FINALISED);

        const buttonText = shouldBlockProgression
            ? (generalStatus.isFinalized ? "Deal Finalized" : "Currently Blocked (Confirmed Buyer)")
            : currentStep.nextLabel;

        const isFinalStep = currentStep.stage === BOOKING_STAGES.DEAL_FINALISED;


        return (
            <div className="booking-individual-flow">

                {/* Back Button */}
                {userStepIndex > 0 && (
                    <button
                        className="back-step-btn"
                        onClick={handleStepBack}
                    >
                        <FaArrowLeft /> Back
                    </button>
                )}

                {/* Current Step Content */}
                <div className="current-flow-step">
                    <h4 className="step-title">{currentStep.title}</h4>
                    <p className="step-info">{currentStep.info}</p>

                    {/* Action Button */}
                    {!isFinalStep && (
                        <button
                            className="next-step-btn"
                            onClick={() => handleNextStep(currentStep.nextStage)}
                            disabled={shouldBlockProgression}
                        >
                            {buttonText}
                        </button>
                    )}

                    {/* Final Step Message */}
                    {isFinalStep && (
                        <div className="deal-finalized-message">
                            <p>🎉 **CONGRATULATIONS!** You have finalized the deal. Proceeding to property registration.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // --- RENDER: Initial Phone Input State ---
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
                            disabled={isFlowLoading || generalStatus.isFinalized}
                        />
                    </div>
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

    // --- RENDER: Flow Display after Phone Input (User Status View) ---
    return (
        <div className="flow-display user-status-view">
            <div className="user-status-header">
                <span className="user-phone-display">Your Tracking Status for: **+91 {phone}**</span>
                <button
                    className="change-phone-btn"
                    onClick={() => {
                        setPhone('');
                        setSubmitted(false);
                        setUserStepIndex(0);
                        setCurrentStage(BOOKING_STAGES.CONTACT_REGISTERED);
                        onStageUpdate(BOOKING_STAGES.CONTACT_REGISTERED, '');
                    }}
                >
                    Change
                </button>
            </div>

            <h4 className="tracker-title">Your Deal Progress</h4>

            {/* Blocked Message */}
            {isBlocked && currentStage !== BOOKING_STAGES.DEAL_FINALISED && (
                <div className="deal-blocked-message">
                    <p>🚨 **DEAL UNAVAILABLE:** This property is finalized by another party. Your process is stopped. You will be notified if the deal falls through.</p>
                </div>
            )}

            {/* Show individual steps only if not blocked, or if the user is the one who finalized */}
            {!isBlocked || currentStage === BOOKING_STAGES.DEAL_FINALISED ? (
                renderUserFlowSteps()
            ) : (
                <div className="tracker-summary">
                    <p>Current Stage: <span className="current-stage-text">{simpleFlowSteps.find(s => s.stage === currentStage)?.title || 'Not Registered'}</span></p>
                </div>
            )}

            <div className="tracker-summary">
                <p className="status-disclaimer">Admin team will contact you via WhatsApp with the next steps.</p>
            </div>
        </div>
    );
};

export default BookingFlow;