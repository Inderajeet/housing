// src/seller/AddPropertyPage.jsx
import React, { useState } from 'react';
import Step1_BasicDetails from './components/Step1_BasicDetails';
import Step2_PropertyDetails from './components/Step2_PropertyDetails';
import Step3_PriceDetails from './components/Step3_PriceDetails';
import './styles/AddPropertyStyles.css';
import { Link } from 'react-router-dom';

const initialFormData = {
    propertyType: 'Residential', // Default to Residential as per request
    lookingTo: '', 
    city: 'Select City',
    
    // Step 2 Fields
    locality: '',
    bhk: '',
    builtUpArea: null,
    areaUnit: 'Select Area Unit',
    furnishType: '',
    amenities: [],
    
    // Step 3 Fields
    cost: null,
    constructionStatus: '',
};

const STEPS = [
    { name: 'Basic Details', statusKey: 'propertyType' },
    { name: 'Property Details', statusKey: 'locality' },
    { name: 'Price Details', statusKey: 'cost' },
];

const AddPropertyPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);

    // Determines the status (Completed, In Progress, Pending) for the tracker
    const getStepStatus = (stepIndex) => {
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'active';
        return 'pending';
    };
    
    // Universal change handler for form data
    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = () => {
        console.log("Submitting Property Data:", formData);
        alert('Property Posted Successfully! (Data logged to console)');
        // Logic to send data to backend goes here
        // Reset form or navigate away
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1_BasicDetails
                        data={formData}
                        handleChange={handleChange}
                        handleNextStep={handleNextStep}
                    />
                );
            case 2:
                return (
                    <Step2_PropertyDetails
                        data={formData}
                        handleChange={handleChange}
                        handlePrevStep={handlePrevStep}
                        handleNextStep={handleNextStep}
                    />
                );
            case 3:
                return (
                    <Step3_PriceDetails
                        data={formData}
                        handleChange={handleChange}
                        handlePrevStep={handlePrevStep}
                        handleSubmit={handleSubmit}
                    />
                );
            default:
                return <p>Step not found.</p>;
        }
    };

    // Calculate completion progress for display next to the title
    const progress = Math.round((currentStep / STEPS.length) * 100);

    return (
        <div className="add-property-container">
            {/* --- Left Progress Tracker (Screens 2, 3, 4, 5, 6) --- */}
            <div className="property-post-tracker">
                <Link to="/dashboard" style={{ color: '#4c1d95', textDecoration: 'none', fontWeight: '500', display: 'block', marginBottom: '2rem' }}>
                    &lt; Return to dashboard
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Post your property</h3>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{progress}%</span>
                </div>
                
                {/* Progress Bar (simplified to a width) */}
                <div style={{ height: '5px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '2.5rem' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#9333ea', borderRadius: '4px', transition: 'width 0.5s' }}></div>
                </div>

                {/* Vertical Stepper */}
                {STEPS.map((step, index) => {
                    const status = getStepStatus(index + 1);
                    return (
                        <div key={step.name} className={`tracker-item ${status}`}>
                            <div className="tracker-status-icon" style={{ backgroundColor: status === 'completed' ? '#10b981' : status === 'active' ? '#9333ea' : '#d1d5db' }}>
                                {status === 'completed' ? '✓' : index + 1}
                            </div>
                            <div className="tracker-step-info">
                                <p className="tracker-status-text">{step.name}</p>
                                <p style={{ color: status === 'active' ? '#9333ea' : '#9ca3af', fontWeight: status === 'active' ? '600' : 'normal' }}>
                                    {status === 'completed' ? 'Completed' : status === 'active' ? 'In progress' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    );
                })}
                
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '2.5rem' }}>
                    <p style={{ color: '#9333ea', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Need help?</p>
                    <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>Now you can directly post property via 💬 WhatsApp ></p>
                </div>
            </div>

            {/* --- Right Form Content Area --- */}
            <div className="property-form-content">
                {renderStepContent()}
            </div>
        </div>
    );
};

export default AddPropertyPage;