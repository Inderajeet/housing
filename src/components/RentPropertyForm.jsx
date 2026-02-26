import React, { useState, useEffect } from 'react';
import { endpoints } from '../api/api';

const RentPropertyForm = ({ data, onChange, onSubmit }) => {
    const [districtsList, setDistrictsList] = useState([]);
    const [taluksList, setTaluksList] = useState([]);
    const [villagesList, setVillagesList] = useState([]);
    const [stagedImages, setStagedImages] = useState([]);
    const [stagedDocs, setStagedDocs] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const bhkOptions = ['1', '2', '3+'];
    const typeOptions = ['Commercial', 'Residential'];

    // 1. Initial Load: Districts
    useEffect(() => {
        endpoints.getDistricts().then(res => setDistrictsList(res.data || []));
    }, []);

    // 2. Fetch Taluks when District changes
    useEffect(() => {
        if (!data.district_id) {
            setTaluksList([]);
            return;
        }
        endpoints.getTaluks(data.district_id).then(res => setTaluksList(res.data || []));
    }, [data.district_id]);

    // 3. Fetch Villages when Taluk changes
    useEffect(() => {
        if (!data.taluk_id) {
            setVillagesList([]);
            return;
        }
        endpoints.getVillages(data.taluk_id).then(res => setVillagesList(res.data || []));
    }, [data.taluk_id]);

    const handleFileSelect = (e, category) => {
        const files = Array.from(e.target.files).map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        if (category === 'images') {
            // Check if adding these files would exceed the limit of 3
            if (stagedImages.length + files.length > 3) {
                alert(`You can only upload a maximum of 3 property images. You already have ${stagedImages.length} image(s) selected.`);
                return;
            }
            setStagedImages(prev => [...prev, ...files]);
        } else {
            setStagedDocs(prev => [...prev, ...files]);
        }
    };

    const removeStagedFile = (id, category) => {
        if (category === 'images') {
            setStagedImages(prev => prev.filter(f => f.id !== id));
        } else {
            setStagedDocs(prev => prev.filter(f => f.id !== id));
        }
    };

    const handleUploadFiles = async () => {
        if (!data.property_id) {
            alert("Save basic property info first to get a Property ID.");
            return;
        }
        if (stagedImages.length === 0 && stagedDocs.length === 0) {
            alert("No files selected.");
            return;
        }

        setIsUploading(true);
        try {
            // Upload Images
            for (const item of stagedImages) {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('asset_type', 'image');
                await endpoints.uploadAsset(data.property_id, formData);
            }

            // Upload Documents
            for (const item of stagedDocs) {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('asset_type', 'document');
                await endpoints.uploadAsset(data.property_id, formData);
            }

            alert("All files uploaded successfully!");
            setStagedImages([]);
            setStagedDocs([]);
        } catch (err) {
            console.error(err);
            alert("Upload failed. Check if your backend is running.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="modal-content property-form">
            <h2>Property Details</h2>
            {/* <p>Complete the details below to list your property.</p> */}
            
            {/* Alternate Phone Number Field - NEW */}
            <div className="form-group">
                <label>Alternate Phone Number</label>
                <input
                    type="tel"
                    placeholder=""
                    value={data.alternate_phone || ''}
                    onChange={(e) => onChange('alternate_phone', e.target.value)}
                    maxLength={10}
                    className="input-field"
                />
            </div>

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
            {/* Commercial Selection */}
            {data.propertyType == 'Commercial' && (
                <div className='form-group dual-input'>
                    <div>
                        <label>Extent Area</label>
                        <input
                            type='number'
                            value={data.extent_area || ''}
                            onChange={(e) => onChange('extent_area', e.target.value)}
                            className='input-field'
                            placeholder='e.g. 1200'
                        />
                    </div>
                    <div>
                        <label>Unit</label>
                        <select
                            value={data.extent_unit || ''}
                            onChange={(e) => onChange('extent_unit', e.target.value)}
                            className='select-field'
                        >
                            <option value="">Select Unit</option>
                            <option value="sqft">Sq. Feet</option>
                            <option value="sqmt">Sq. Meters</option>
                            <option value="acres">Acres</option>
                            <option value="cents">Cents</option>
                        </select>
                    </div>
                </div>
            )}
            {/* BHK Selection */}
            {data.propertyType === 'Residential' && (
                <div className="form-group">
                    <label>Bedrooms (BHK)</label>
                    <div className="option-group">
                        {bhkOptions.map(bhk => (
                            <button
                                key={bhk}
                                type="button"
                                className={`option-btn ${data.bhk === bhk ? 'active' : ''}`}
                                onClick={() => onChange('bhk', bhk)}
                            >
                                {bhk}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Financials */}
            <div className="form-group dual-input">
                <div>
                    <label>Expected Rent (₹)</label>
                    <input
                        type="number"
                        value={data.rentAmount || ''}
                        onChange={(e) => onChange('rentAmount', e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <label>Advance Deposit (₹)</label>
                    <input
                        type="number"
                        value={data.advanceAmount || ''}
                        onChange={(e) => onChange('advanceAmount', e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            {/* Location: Correctly using IDs */}
            <div className="form-group location-dropdowns">
                <label>Location Details</label>
                <select
                    value={data.district_id || ''}
                    onChange={(e) => {
                        onChange('district_id', e.target.value);
                        onChange('taluk_id', '');
                        onChange('village_id', '');
                    }}
                    className="select-field"
                >
                    <option value="">Select District</option>
                    {districtsList.map(d => (
                        <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                    ))}
                </select>

                <select
                    value={data.taluk_id || ''}
                    onChange={(e) => {
                        onChange('taluk_id', e.target.value);
                        onChange('village_id', '');
                    }}
                    disabled={!data.district_id}
                    className="select-field"
                >
                    <option value="">Select Taluk</option>
                    {taluksList.map(t => (
                        <option key={t.taluk_id} value={t.taluk_id}>{t.taluk_name}</option>
                    ))}
                </select>

                <select
                    value={data.village_id || ''}
                    onChange={(e) => onChange('village_id', e.target.value)}
                    disabled={!data.taluk_id}
                    className="select-field"
                >
                    <option value="">Select Village/Area</option>
                    {villagesList.map(v => (
                        <option key={v.village_id} value={v.village_id}>{v.village_name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Landmark / Street</label>
                <input
                    type="text"
                    value={data.landmark || ''}
                    onChange={(e) => onChange('landmark', e.target.value)}
                    className="input-field"
                />
            </div>
            {/* Premium Ads Preference */}
            <div className="form-group premium-checkbox">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={data.premium_requested || false}
                        onChange={(e) => onChange('premium_requested', e.target.checked)}
                    />
                    <span>
                        Promote this property as a <strong>Premium Ad</strong> for better visibility
                    </span>
                </label>
            </div>

            <hr />

            {/* Images - Updated with limit indicator */}
            <div className="form-group">
                <label>Property Photos (Max 3 images)</label>
                <div className="upload-limit-indicator">
                    <span>{stagedImages.length} / 3 images selected</span>
                </div>
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => handleFileSelect(e, 'images')}
                    disabled={stagedImages.length >= 3}
                />
                {stagedImages.length >= 3 && (
                    <p className="upload-limit-message">Maximum 3 images reached. Please remove some to add more.</p>
                )}
                <div className="media-preview-container">
                    {stagedImages.map((item) => (
                        <div key={item.id} className="media-item">
                            <img src={item.preview} alt="Preview" className="media-thumbnail" />
                            <button type="button" className="remove-media-btn" onClick={() => removeStagedFile(item.id, 'images')}>✕</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Docs */}
            <div className="form-group">
                <label>Documents (PDF/Word)</label>
                <input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'docs')} />
                <div className="doc-list-container">
                    {stagedDocs.map((item) => (
                        <div key={item.id} className="doc-item">
                            <span>📄 {item.name}</span>
                            <button type="button" className="remove-media-btn-pdf" onClick={() => removeStagedFile(item.id, 'docs')}>✕</button>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                className="upload-btn"
                onClick={handleUploadFiles}
                disabled={isUploading || (stagedImages.length === 0 && stagedDocs.length === 0)}
            >
                {isUploading ? 'Uploading...' : 'Upload Selected Files'}
            </button>

            <div className="modal-actions full-width-center">
                <button
                    type="button"
                    onClick={onSubmit}
                    className="primary-button save-and-continue"
                    disabled={isUploading}
                >
                    Post Your Property
                </button>
            </div>
        </div>
    );
};

export default RentPropertyForm;