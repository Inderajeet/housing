// src/components/PostPropertyFlow.jsx
import React, { useState, useCallback, useMemo } from 'react';
import "../styles/Modal.css";
import { endpoints } from '../api/api';

// Import the specific form components for Step 3
import RentPropertyForm from './RentPropertyForm';
import SalePropertyForm from './SalePropertyForm';

import LiveLocationModal from './LiveLocationModal';
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
    rent_propertyType: 5, rent_bhk: 5, rent_extent: 5, rent_rentAmount: 5, rent_advanceAmount: 5,

    // sale Fields
    sale_propertyType: 5, sale_price: 10, sale_survey_number: 5, sale_documents: 5,

    // Common Location & Media
    district: 5, taluk: 5, village: 5, street_name_or_road_name: 5, mediaFiles: 15,
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
    if (data.street_name_or_road_name) score += FIELD_WEIGHTS.street_name_or_road_name;
    if (data.mediaFiles && data.mediaFiles.length > 0) score += FIELD_WEIGHTS.mediaFiles;

    // Transaction-specific fields
    if (data.transactionType === 'rent') {
        if (data.propertyType) score += FIELD_WEIGHTS.rent_propertyType;

        if (data.propertyType === 'Residential' && data.bhk)
            score += FIELD_WEIGHTS.rent_bhk;

        if (data.propertyType === 'Commercial' && data.extent_area && data.extent_unit)
            score += FIELD_WEIGHTS.rent_extent; // reuse same weight OR create new

        if (data.rentAmount) score += FIELD_WEIGHTS.rent_rentAmount;
        if (data.advanceAmount) score += FIELD_WEIGHTS.rent_advanceAmount;
    }
    else if (data.transactionType === 'sale') {
        if (data.saleType) score += FIELD_WEIGHTS.sale_propertyType;
        if (data.price) score += FIELD_WEIGHTS.sale_price;
        if (data.survey_number) score += FIELD_WEIGHTS.sale_survey_number;
        // Check if any of the document fields are populated
        if (data.allDocuments.length > 0 || data.drawings.length > 0 || data.brochure.length > 0) score += FIELD_WEIGHTS.sale_documents;
        maxScore = FIELD_WEIGHTS.number + FIELD_WEIGHTS.latitude + FIELD_WEIGHTS.liveImage + FIELD_WEIGHTS.sale_propertyType + FIELD_WEIGHTS.sale_price + FIELD_WEIGHTS.sale_survey_number + FIELD_WEIGHTS.sale_documents + FIELD_WEIGHTS.district + FIELD_WEIGHTS.taluk + FIELD_WEIGHTS.village + FIELD_WEIGHTS.street_name_or_road_name + FIELD_WEIGHTS.mediaFiles;
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
                {/* The background track line */}
                <div className="progress-bar-line">
                    <div
                        className="progress-fill"
                        style={{ width: `${stepWidth}%` }}
                    ></div>
                </div>

                {STEPS.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isActive = stepNumber === currentStep;

                    return (
                        <div
                            key={step.id}
                            className={`step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        >
                            {/* Logic: Show checkmark if done, otherwise show number */}
                            {isCompleted ? '✓' : ''}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- STEP 1: Number Capture Modal (Reused) ---
const NumberCaptureModal = ({ data, onChange, onNext }) => {
    return (
        <div className="modal-content">
            <h2>Contact Details</h2>
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
    premium_requested: false,
    extent_area: '',
    extent_unit: '',

    // sale Fields
    saleType: '',
    price: '',
    survey_number: '',

    area_size: '',
    street_name_or_road_name: '',

    boundary_north: '',
    boundary_south: '',
    boundary_east: '',
    boundary_west: '',

    total_units_count: '',
    booked_units: '',
    open_units: '',
    allDocuments: [],
    drawings: [],
    brochure: [],

    // Common Location & Media
    district: '',
    taluk: '',
    village: '',
    street_name_or_road_name: '',
    mediaFiles: [],
};

// --- MAIN FLOW COMPONENT ---
const PostPropertyFlow = ({ onClose, initialTransactionType = 'rent', onSuccessfulPost }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(() => ({
        ...initialFormData,
        property_id: null, //Track the ID
        transactionType: initialTransactionType.toLowerCase() === 'sale' ? 'sale' : 'rent'
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

    const handleNext = useCallback(async () => {
        // setCurrentStep(prev => prev < STEPS.length ? prev + 1 : prev);
        if (currentStep === 2) {
            setLoading(true);
            try {
                const payload = {
                    contact_phone: formData.number,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    property_type: formData.transactionType,
                    // verification_image: formData.liveImage
                };

                const response = await endpoints.createProperty(formData.transactionType, payload);
                handleDataChange('property_id', response.data.property_id);
                setCurrentStep(3);
            } catch (err) {
                alert("Failed to initialize property. Please try again");
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, formData]);

    // Inside PostPropertyFlow.jsx
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Build a dynamic payload based on transactionType
            let finalPayload = {
                district_id: formData.district_id,
                taluk_id: formData.taluk_id,
                village_id: formData.village_id,
                street_name_or_road_name: formData.street_name_or_road_name,
                premium_requested: formData.premium_requested === true,
            };

            if (formData.transactionType === 'rent') {
                finalPayload = {
                    ...finalPayload,
                    property_use: formData.propertyType, // 🔥 THIS IS KEY
                    bhk:
                        formData.propertyType === 'Residential'
                            ? formData.bhk
                            : null,

                    rent_amount: formData.rentAmount,
                    advance_amount: formData.advanceAmount,

                    // Commercial only
                    extent_area:
                        formData.propertyType === 'Commercial'
                            ? formData.extent_area
                            : null,

                    extent_unit:
                        formData.propertyType === 'Commercial'
                            ? formData.extent_unit
                            : null,
                };
            }
            else {
                // Sale Specific Fields
                finalPayload = {
                    ...finalPayload,
                    sale_type: formData.saleType, // Make sure keys match your backend column names
                    price: formData.price,
                    survey_number: formData.survey_number,
                    area_size: formData.area_size || null,
                    street_name_or_road_name: formData.street_name_or_road_name || null,
                    boundary_north: formData.boundary_north,
                    boundary_south: formData.boundary_south,
                    boundary_east: formData.boundary_east,
                    boundary_west: formData.boundary_west,
                    total_units_count: formData.total_units_count,
                    booked_units: formData.booked_units,
                    open_units: formData.open_units,
                };
            }

            // 2. Call updateProperty with the dynamic mode ('rent' or 'sale')
            // This ensures the URL becomes /api/frontend/sale/:id instead of /rent/:id
            await endpoints.updateProperty(
                formData.transactionType,
                formData.property_id,
                finalPayload
            );

            onSuccessfulPost(formData.number);
        } catch (err) {
            console.error("Submission error:", err);
            alert("Failed to post property details. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };
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
                    <SalePropertyForm
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
            <div className={`post-property-modal ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading && <div className="absolute inset-0 flex items-center justify-center z-50">Saving...</div>}
                <div className="modal-header">
                    <ProgressBar currentStep={currentStep} />
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>
                {StepComponent}
            </div>
        </div>
    );
};

export default PostPropertyFlow;
