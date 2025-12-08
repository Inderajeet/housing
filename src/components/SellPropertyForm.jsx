// src/components/SellPropertyForm.jsx
import React, { useMemo } from 'react';

// Mock Location Data (Needs to be defined or imported from a shared constants file)
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

const SellPropertyForm = ({ data, onChange, onSubmit }) => {
    
    const districts = useMemo(() => Object.keys(LOCATION_DATA['Tamil Nadu']), []);
    const taluks = useMemo(() => data.district && LOCATION_DATA['Tamil Nadu'][data.district] ? Object.keys(LOCATION_DATA['Tamil Nadu'][data.district]) : [], [data.district]);
    const villages = useMemo(() => data.district && data.taluk && LOCATION_DATA['Tamil Nadu'][data.district][data.taluk] ? LOCATION_DATA['Tamil Nadu'][data.district][data.taluk] : [], [data.district, data.taluk]);

    const propertyTypes = ['Land / Plot', 'Flat', 'Individual House'];

    // Helper for specialized file uploads (PDFs, Drawings)
    const handleFileUpload = (key, e) => {
        const files = Array.from(e.target.files).map(file => ({
            file,
            name: file.name
        }));
        // Note: For simplicity, this replaces previous files.
        onChange(key, files);
    };

    // Helper for Images/Videos upload
    const handleMediaUpload = (e) => {
        const files = Array.from(e.target.files).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));
        const newFiles = [...data.mediaFiles, ...files].slice(0, 10); 
        onChange('mediaFiles', newFiles);
    };

    const handleRemoveMedia = (key, index) => {
        const newFiles = data[key].filter((_, i) => i !== index);
        onChange(key, newFiles);
    };
    
    // Boundary data keys (assuming these keys were added to initialFormData in PostPropertyFlow)
    // boundary_north, boundary_south, boundary_east, boundary_west
    
    return (
        <div className="modal-content property-form">
            <h2>3. Sell Property Details</h2> 
            <p>Provide detailed information about your property for sale to potential buyers.</p>

            {/* Property Type Selection (Land/Flat/House) */}
            <div className="form-group">
                <label>Property Type</label>
                <div className="option-group">
                    {propertyTypes.map(t => (
                        <button
                            key={t}
                            className={`option-btn ${data.sellType === t ? 'active' : ''}`}
                            onClick={() => onChange('sellType', t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Price and S.No */}
            <div className="form-group dual-input">
                <div>
                    <label>Expected Price (₹)</label>
                    <input 
                        type="number" 
                        placeholder="e.g., 5000000 (50 Lakhs)"
                        value={data.price}
                        onChange={(e) => onChange('price', e.target.value)}
                        className="input-field"
                    />
                </div>
                 <div>
                    <label>Survey/S.No:</label>
                    <input 
                        type="text" 
                        placeholder="E.g., 123/2A"
                        value={data.sNo}
                        onChange={(e) => onChange('sNo', e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            {/* 🛑 NEW: BOUNDARY DETAILS 🛑 */}
            <div className="form-group boundary-details-container">
                <label>Boundary Details</label>
                <div className="boundary-grid">
                    {/* NORTH */}
                    <div className="boundary-input north">
                        <label>North</label>
                        <input
                            type="text"
                            placeholder="North Boundary"
                            value={data.boundary_north}
                            onChange={(e) => onChange('boundary_north', e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {/* WEST & EAST (Middle Row) */}
                    <div className="boundary-center-row">
                        <div className="boundary-input west">
                            <label>West</label>
                            <input
                                type="text"
                                placeholder="West Boundary"
                                value={data.boundary_west}
                                onChange={(e) => onChange('boundary_west', e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div className="boundary-box-label">BOUNDARY</div>
                        <div className="boundary-input east">
                            <label>East</label>
                            <input
                                type="text"
                                placeholder="East Boundary"
                                value={data.boundary_east}
                                onChange={(e) => onChange('boundary_east', e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* SOUTH */}
                    <div className="boundary-input south">
                        <label>South</label>
                        <input
                            type="text"
                            placeholder="South Boundary"
                            value={data.boundary_south}
                            onChange={(e) => onChange('boundary_south', e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>
            </div>
            {/* 🛑 END NEW SECTION 🛑 */}
            
            {/* Location Dropdowns (Moved below Boundary) */}
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
                    placeholder="E.g., Near Main Road"
                    value={data.landmark}
                    onChange={(e) => onChange('landmark', e.target.value)}
                    className="input-field"
                />
            </div>
            
            {/* Image/Video Upload */}
            <div className="form-group">
                <label>1. Upload Property Photos/Videos (Max 10)</label>
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
                                    onClick={() => handleRemoveMedia('mediaFiles', index)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Document Uploads (Sell Specific) */}
            <div className="form-group">
                <label>2. Upload All Documents (PDFs only)</label>
                <input 
                    type="file" 
                    multiple 
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload('allDocuments', e)}
                />
                <div className="file-list">
                    {data.allDocuments.map((item, index) => (
                         <div key={index} className="file-item">
                            📄 {item.name}
                            <button onClick={() => handleRemoveMedia('allDocuments', index)}>✕</button>
                         </div>
                    ))}
                </div>
            </div>
            <div className="form-group">
                <label>3. Upload Drawings of Flat/Plot (e.g., blueprints, PDFs)</label>
                <input 
                    type="file" 
                    multiple 
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={(e) => handleFileUpload('drawings', e)}
                />
                <div className="file-list">
                    {data.drawings.map((item, index) => (
                         <div key={index} className="file-item">
                            📐 {item.name}
                            <button onClick={() => handleRemoveMedia('drawings', index)}>✕</button>
                         </div>
                    ))}
                </div>
            </div>
             <div className="form-group">
                <label>4. Upload Brochure (Optional)</label>
                <input 
                    type="file" 
                    multiple 
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload('brochure', e)}
                />
                 <div className="file-list">
                    {data.brochure.map((item, index) => (
                         <div key={index} className="file-item">
                            📰 {item.name}
                            <button onClick={() => handleRemoveMedia('brochure', index)}>✕</button>
                         </div>
                    ))}
                </div>
            </div>


            <div className="modal-actions full-width-center">
                <button onClick={onSubmit} className="primary-button save-and-continue">
                    Post Your Property for Sale
                </button>
            </div>
        </div>
    );
};

export default SellPropertyForm;