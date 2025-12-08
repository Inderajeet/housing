// src/components/RentPropertyForm.jsx
import React, { useMemo } from 'react';

// Mock Location Data (Needs to be defined or imported)
const LOCATION_DATA = {
    'Tamil Nadu': {
        Chennai: {
            'Taluk A (North)': ['T. Nagar', 'Mylapore'],
            'Taluk B (South)': ['Velachery', 'Perungudi'],
        },
        Coimbatore: {
            'Taluk C (East)': ['Gopalapuram', 'Ramanathapuram'],
        },
    }
};


const RentPropertyForm = ({ data, onChange, onSubmit }) => {
    
    const districts = useMemo(() => Object.keys(LOCATION_DATA['Tamil Nadu']), []);
    const taluks = useMemo(() => data.district && LOCATION_DATA['Tamil Nadu'][data.district] ? Object.keys(LOCATION_DATA['Tamil Nadu'][data.district]) : [], [data.district]);
    const villages = useMemo(() => data.district && data.taluk && LOCATION_DATA['Tamil Nadu'][data.district][data.taluk] ? LOCATION_DATA['Tamil Nadu'][data.district][data.taluk] : [], [data.district, data.taluk]);

    const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
    const typeOptions = ['Commercial', 'Residential'];

    const handleMediaUpload = (e) => {
        const files = Array.from(e.target.files).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));
        // Concatenate new files and limit to 10
        const newFiles = [...data.mediaFiles, ...files].slice(0, 10); 
        onChange('mediaFiles', newFiles);
    };

    const handleRemoveMedia = (index) => {
        const newFiles = data.mediaFiles.filter((_, i) => i !== index);
        onChange('mediaFiles', newFiles);
    };
    
    return (
        <div className="modal-content property-form">
            <h2>3. Rent Property Details</h2> 
            <p>Tell us more about your rental property to attract the right tenants.</p>

            {/* BHK/Type Selection */}
            <div className="form-group">
                <label>Property Type</label>
                <div className="option-group">
                    {typeOptions.map(t => (
                        <button
                            key={t}
                            className={`option-btn ${data.propertyType === t ? 'active' : ''}`}
                            onClick={() => onChange('propertyType', t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* BHK Selection (Only visible if Residential) */}
            {data.propertyType === 'Residential' && (
                <div className="form-group">
                    <label>Bedrooms (BHK)</label>
                    <div className="option-group">
                        {bhkOptions.map(bhk => (
                            <button
                                key={bhk}
                                className={`option-btn ${data.bhk === bhk ? 'active' : ''}`}
                                onClick={() => onChange('bhk', bhk)}
                            >
                                {bhk}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Financial Details */}
            <div className="form-group dual-input">
                <div>
                    <label>Expected Rent (₹)</label>
                    <input 
                        type="number" 
                        placeholder="e.g., 20000"
                        value={data.rentAmount}
                        onChange={(e) => onChange('rentAmount', e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <label>Advance/Security Deposit (₹)</label>
                    <input 
                        type="number" 
                        placeholder="e.g., 100000"
                        value={data.advanceAmount}
                        onChange={(e) => onChange('advanceAmount', e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            {/* Location Dropdowns */}
            <div className="form-group location-dropdowns">
                <label>Location Details</label>
                <select value={data.district} onChange={(e) => onChange('district', e.target.value)} className="select-field">
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={data.taluk} onChange={(e) => onChange('taluk', e.target.value)} disabled={!data.district} className="select-field">
                    <option value="">Select Taluk</option>
                    {taluks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={data.village} onChange={(e) => onChange('village', e.target.value)} disabled={!data.taluk} className="select-field">
                    <option value="">Select Village/Area</option>
                    {villages.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
            
            <div className="form-group">
                <label>Landmark / Street Name</label>
                <input 
                    type="text" 
                    placeholder="E.g., Near Apollo Hospital"
                    value={data.landmark}
                    onChange={(e) => onChange('landmark', e.target.value)}
                    className="input-field"
                />
            </div>
            
            {/* Image/Video Upload with Preview */}
            <div className="form-group">
                <label>Upload Property Images/Videos (Max 10)</label>
                <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                />
                
                {data.mediaFiles && data.mediaFiles.length > 0 && (
                    <div className="media-preview-container">
                        {data.mediaFiles.map((item, index) => (
                            <div key={index} className="media-item">
                                {item.file.type.startsWith('image/') ? (
                                    <img src={item.preview} alt="Property Preview" className="media-thumbnail" />
                                ) : (
                                    <span className="media-thumbnail video-placeholder">📹 Video</span>
                                )}
                                <button 
                                    className="remove-media-btn" 
                                    onClick={() => handleRemoveMedia(index)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="modal-actions full-width-center">
                <button onClick={onSubmit} className="primary-button save-and-continue">
                    Post Your Rent Property
                </button>
            </div>
        </div>
    );
};

export default RentPropertyForm;