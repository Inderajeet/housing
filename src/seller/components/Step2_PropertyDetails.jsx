// src/seller/components/Step2_PropertyDetails.jsx
import React, { useState } from 'react';
import AmenitiesModal from './AmenitiesModal';

// Placeholder icons for furnishing types
const furnishingIcons = {
    'Fully Furnished': '🛋️', 
    'Semi Furnished': '🪑', 
    'Unfurnished': '📦' 
};

const bhkOptions = ['1 RK', '1 BHK', '1.5 BHK', '2 BHK', '3+ BHK'];
const areaUnits = ['Select Area Unit', 'sq. ft.', 'sq. mtr.', 'acres'];

const Step2_PropertyDetails = ({ data, handleChange, handlePrevStep, handleNextStep }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Validation check for this step
    const isStepValid = data.locality && 
                       data.bhk && 
                       data.builtUpArea > 0 && 
                       data.areaUnit !== 'Select Area Unit' &&
                       data.furnishType;
                       
    // Toggle selected amenities in the form state
    const toggleAmenity = (amenityName) => {
        const newAmenities = data.amenities.includes(amenityName)
            ? data.amenities.filter(name => name !== amenityName)
            : [...data.amenities, amenityName];
        handleChange('amenities', newAmenities);
    };

    return (
        <div style={{ height: '100%' }}>
            <button 
                onClick={handlePrevStep}
                style={{ background: 'none', border: 'none', color: '#4b5563', marginBottom: '1.5rem', cursor: 'pointer', fontWeight: '500' }}
            >
                &lt; Return to dashboard
            </button>
            <h2 className="form-title">Add Property Details</h2>

            {/* --- Locality (Screen 2) --- */}
            <div className="input-field-group">
                <label className="form-section-title" htmlFor="locality">Locality</label>
                <input
                    id="locality"
                    type="text"
                    className="text-input"
                    placeholder="Enter a valid locality"
                    value={data.locality}
                    onChange={(e) => handleChange('locality', e.target.value)}
                />
                {!data.locality && <p className="validation-error">Please enter a valid locality</p>}
            </div>

            {/* --- BHK (Screen 3) --- */}
            <div className="input-field-group">
                <label className="form-section-title">BHK</label>
                <div className="toggle-group">
                    {bhkOptions.map(bhk => (
                        <button
                            key={bhk}
                            className={`toggle-button ${data.bhk === bhk ? 'active' : ''}`}
                            onClick={() => handleChange('bhk', bhk)}
                        >
                            {bhk}
                        </button>
                    ))}
                </div>
                {!data.bhk && <p className="validation-error">Please select the BHK</p>}
            </div>

            {/* --- Built Up Area & Unit (Screen 3) --- */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className="input-field-group" style={{ flex: 2 }}>
                    <label className="form-section-title" htmlFor="builtUpArea">Built Up Area</label>
                    <input
                        id="builtUpArea"
                        type="number"
                        className="text-input"
                        placeholder="Saleable area should be between 150 sq. ft. and 1500 sq. ft."
                        value={data.builtUpArea || ''}
                        min="150"
                        max="1500"
                        onChange={(e) => handleChange('builtUpArea', Number(e.target.value))}
                    />
                </div>
                <div className="input-field-group" style={{ flex: 1 }}>
                    <label className="form-section-title" style={{ color: '#fff' }}>Select Area Unit</label> {/* Invisible label */}
                    <select
                        className="select-input"
                        value={data.areaUnit}
                        onChange={(e) => handleChange('areaUnit', e.target.value)}
                    >
                        {areaUnits.map(unit => (
                            <option key={unit} value={unit} disabled={unit === 'Select Area Unit'}>
                                {unit}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {(!data.builtUpArea || data.areaUnit === 'Select Area Unit') && <p className="validation-error">Please specify built-up area and unit</p>}

            {/* --- Furnish Type (Screen 4) --- */}
            <div className="input-field-group">
                <label className="form-section-title">Furnish Type</label>
                <div className="icon-select-group">
                    {Object.entries(furnishingIcons).map(([type, icon]) => (
                        <div
                            key={type}
                            className={`icon-button ${data.furnishType === type ? 'active' : ''}`}
                            onClick={() => handleChange('furnishType', type)}
                        >
                            <span style={{fontSize: '32px'}}>{icon}</span>
                            {type}
                        </div>
                    ))}
                </div>
                {!data.furnishType && <p className="validation-error">Please select the furnish type</p>}
            </div>
            
            {/* --- Add Amenities Link (Screen 4) --- */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#4c1d95', cursor: 'pointer', fontWeight: '600' }}
                >
                    + Add Furnishings / Amenities ({data.amenities.length})
                </button>
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                <button
                    style={{ background: '#e5e7eb', color: '#4b5563', padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={handlePrevStep}
                >
                    &lt; Back
                </button>
                <button
                    style={{ backgroundColor: isStepValid ? '#059669' : '#a7f3d0', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: isStepValid ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s' }}
                    onClick={isStepValid ? handleNextStep : null}
                    disabled={!isStepValid}
                >
                    Next, add price details
                </button>
            </div>

            {/* Amenities Modal (Screen 5) */}
            <AmenitiesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedAmenities={data.amenities}
                toggleAmenity={toggleAmenity}
            />
        </div>
    );
};

export default Step2_PropertyDetails;