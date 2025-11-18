// src/seller/components/Step3_PriceDetails.jsx
import React from 'react';

const Step3_PriceDetails = ({ data, handleChange, handlePrevStep, handleSubmit }) => {
    
    // Hardcoded Price Estimation (from screenshot)
    const estimatedMin = '13,63,031';
    const estimatedMax = '16,65,927';

    // Validation check for this step
    const isStepValid = data.cost > 0 && data.constructionStatus;

    return (
        <div style={{ height: '100%' }}>
            <button 
                onClick={handlePrevStep}
                style={{ background: 'none', border: 'none', color: '#4b5563', marginBottom: '1.5rem', cursor: 'pointer', fontWeight: '500' }}
            >
                &lt; Return to Property Details
            </button>
            <h2 className="form-title">Add Price Details</h2>

            {/* Progress/Percentage Indicator (Simplified) */}
            <div style={{ padding: '0.5rem', backgroundColor: '#e5e7eb', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '90%', height: '8px', backgroundColor: '#9333ea', borderRadius: '0.5rem' }}></div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>27% Completed</p>


            {/* Price Estimation Box (Screen 6) */}
            <div className="price-estimation-box">
                <p>
                    🥇 Estimated price of your property based on price trends is around 
                    <span style={{ fontWeight: '700' }}> ₹{estimatedMin} - ₹{estimatedMax}</span>
                </p>
            </div>
            
            {/* Cost Input (Screen 6) */}
            <div className="input-field-group">
                <label className="form-section-title" htmlFor="cost">Cost</label>
                <input
                    id="cost"
                    type="number"
                    className="text-input"
                    placeholder="Enter the property price"
                    value={data.cost || ''}
                    onChange={(e) => handleChange('cost', Number(e.target.value))}
                />
                {!data.cost && <p className="validation-error">Please enter the cost</p>}
            </div>

            {/* Construction Status (Screen 6) */}
            <div className="input-field-group">
                <label className="form-section-title" style={{ marginTop: '1rem' }}>Construction Status</label>
                <div className="toggle-group">
                    {['Ready to Move', 'Under Construction'].map(status => (
                        <button
                            key={status}
                            className={`toggle-button ${data.constructionStatus === status ? 'active' : ''}`}
                            onClick={() => handleChange('constructionStatus', status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                {!data.constructionStatus && <p className="validation-error">Please select the construction status</p>}
            </div>

            {/* Post Property Button (Screen 6) */}
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button
                    style={{ backgroundColor: isStepValid ? '#059669' : '#a7f3d0', color: 'white', padding: '0.75rem 4rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: isStepValid ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s', width: '100%' }}
                    onClick={isStepValid ? handleSubmit : null}
                    disabled={!isStepValid}
                >
                    Post Property
                </button>
            </div>
        </div>
    );
};

export default Step3_PriceDetails;