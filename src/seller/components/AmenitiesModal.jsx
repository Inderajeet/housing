// src/seller/components/AmenitiesModal.jsx
import React from 'react';
import '../styles/AddPropertyStyles.css'; // Import modal specific styles

const initialAmenities = [
    { name: 'Power Backup', icon: '⚡' },
    { name: 'Swimming Pool', icon: '🏊' },
    { name: 'Gym', icon: '💪' },
    { name: 'Lift', icon: '⬆️' },
    { name: 'Intercom', icon: '📞' },
    { name: 'Garden', icon: '🌳' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Kids Area', icon: '🎠' },
    { name: 'CCTV', icon: '📹' },
    { name: 'Gated Community', icon: '🏰' },
    { name: 'Club House', icon: '🍹' },
    { name: 'Community Hall', icon: '🤝' },
    { name: 'Regular Water Supply', icon: '💧' },
];

const AmenitiesModal = ({ isOpen, onClose, selectedAmenities, toggleAmenity }) => {
    if (!isOpen) return null;

    const count = selectedAmenities.length;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add property furnishings and amenities</h3>
                    <button className="close-modal-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>
                
                <p className="amenity-selected-count">{count} selected</p>

                <div className="amenities-grid">
                    {initialAmenities.map((amenity) => {
                        const isSelected = selectedAmenities.includes(amenity.name);
                        return (
                            <div
                                key={amenity.name}
                                className={`amenity-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleAmenity(amenity.name)}
                            >
                                <span style={{fontSize: '24px'}}>{amenity.icon}</span>
                                {amenity.name}
                            </div>
                        );
                    })}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        style={{ backgroundColor: '#7c3aed', color: 'white', padding: '0.75rem 4rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={onClose}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AmenitiesModal;