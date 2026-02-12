import React, { useState, useEffect } from 'react';
import { endpoints } from '../api/api';

const SalePropertyForm = ({ data, onChange, onSubmit }) => {
    // 1. Unified State for Lists (Same as Rent)
    const [districtsList, setDistrictsList] = useState([]);
    const [taluksList, setTaluksList] = useState([]);
    const [villagesList, setVillagesList] = useState([]);

    // 2. Unified State for Uploads (Same as Rent)
    const [stagedImages, setStagedImages] = useState([]);
    const [stagedDocs, setStagedDocs] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const propertyTypes = [
        { label: 'Land', value: 'land' },
        { label: 'Plot', value: 'plot' },
        { label: 'Flat', value: 'flat' },
        { label: 'Individual House', value: 'house' },
    ];

    // --- API FETCHING LOGIC (Identical to Rent) ---
    useEffect(() => {
        endpoints.getDistricts().then(res => setDistrictsList(res.data || []));
    }, []);

    useEffect(() => {
        if (!data.district_id) {
            setTaluksList([]);
            return;
        }
        endpoints.getTaluks(data.district_id).then(res => setTaluksList(res.data || []));
    }, [data.district_id]);

    useEffect(() => {
        if (!data.taluk_id) {
            setVillagesList([]);
            return;
        }
        endpoints.getVillages(data.taluk_id).then(res => setVillagesList(res.data || []));
    }, [data.taluk_id]);

    const getBookedSet = (input) => {
        const bookedSet = new Set();
        if (!input) return bookedSet;
        // if (bookedSet.size > total) return;
        const parts = input.toString().split(',').map(p => p.trim()).filter(Boolean);
        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                if (!Number.isNaN(start) && !Number.isNaN(end)) {
                    for (let i = Math.min(start, end); i <= Math.max(start, end); i++) bookedSet.add(i);
                }
            } else {
                const num = Number(part);
                if (!Number.isNaN(num)) bookedSet.add(num);
            }
        });
        return bookedSet;
    };

    const getRangeString = (numbers) => {
        if (numbers.length === 0) return '';

        numbers.sort((a, b) => a - b);
        const ranges = [];
        let start = numbers[0];
        let end = numbers[0];

        for (let i = 1; i < numbers.length; i++) {
            if (numbers[i] === end + 1) {
                end = numbers[i];
            } else {
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                start = numbers[i];
                end = numbers[i];
            }
        }

        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        return ranges.join(', ');
    };


    useEffect(() => {
        if (!(data.saleType === 'plot' || data.saleType === 'flat')) return;

        const total = parseInt(data.total_units_count, 10) || 0;
        const bookedSet = getBookedSet(data.booked_units);
        const openNumbers = [];
        for (let i = 1; i <= total; i++) {
            if (!bookedSet.has(i)) openNumbers.push(i);
        }
        const computed = getRangeString(openNumbers);

        if (computed !== (data.open_units || '')) {
            onChange('open_units', computed);
        }
    }, [data.saleType, data.total_units_count, data.booked_units, data.open_units, onChange]);

    // --- FILE HANDLING LOGIC (Identical to Rent) ---
    const handleFileSelect = (e, category) => {
        const files = Array.from(e.target.files).map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        if (category === 'images') {
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
            // Upload Images/Videos
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
            alert("Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="modal-content property-form">
            <h2>Sale Property Details</h2>
            <p>Provide detailed information for potential buyers.</p>

            {/* Property Type Selection */}
            <div className="form-group">
                <label>Property Type</label>
                <div className="option-group">
                    {propertyTypes.map(t => (
                        <button
                            key={t.value}
                            type="button"
                            className={`option-btn ${data.saleType === t.value ? 'active' : ''}`}
                            onClick={() => onChange('saleType', t.value)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price and Survey No */}
            <div className="form-group dual-input">
                <div>
                    <label>Expected Price (₹)</label>
                    <input
                        type="number"
                        value={data.price || ''}
                        onChange={(e) => onChange('price', e.target.value)}
                        className="input-field"
                    />
                </div>
                <div>
                    <label>Survey/S.No:</label>
                    <input
                        type="text"
                        value={data.survey_number || ''}
                        onChange={(e) => onChange('survey_number', e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            {(data.saleType === 'plot' || data.saleType === 'flat') && (
                <div className="form-group dual-input">
                    <div>
                        <label>Total Units</label>
                        <input
                            type="number"
                            value={data.total_units_count || ''}
                            onChange={e => onChange('total_units_count', e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label>Booked Units</label>
                        <input
                            disabled={!data.total_units_count}
                            value={data.booked_units || ''}
                            onChange={e => onChange('booked_units', e.target.value)}
                            className="input-field"
                            placeholder="e.g. 1-5, 8"
                        />
                    </div>
                    <div>
                        <label>Available Units (Auto)</label>
                        <input
                            disabled
                            value={data.open_units || ''}
                            className="input-field"
                        />
                    </div>
                </div>
            )}

            {/* Boundary Details */}
            <div className="form-group boundary-details-container">
                <label>Boundary Details</label>
                <div className="boundary-grid">
                    <div className="boundary-input north">
                        <label>North</label>
                        <input type="text" value={data.boundary_north || ''} onChange={(e) => onChange('boundary_north', e.target.value)} className="input-field" />
                    </div>
                    <div className="boundary-center-row">
                        <div className="boundary-input west">
                            <label>West</label>
                            <input type="text" value={data.boundary_west || ''} onChange={(e) => onChange('boundary_west', e.target.value)} className="input-field" />
                        </div>
                        <div className="boundary-box-label">BOUNDARY</div>
                        <div className="boundary-input east">
                            <label>East</label>
                            <input type="text" value={data.boundary_east || ''} onChange={(e) => onChange('boundary_east', e.target.value)} className="input-field" />
                        </div>
                    </div>
                    <div className="boundary-input south">
                        <label>South</label>
                        <input type="text" value={data.boundary_south || ''} onChange={(e) => onChange('boundary_south', e.target.value)} className="input-field" />
                    </div>
                </div>
            </div>

            {/* API Driven Location Dropdowns (Same as Rent) */}
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
                <input type="text" value={data.street_name_or_road_name || ''} onChange={(e) => onChange('street_name_or_road_name', e.target.value)} className="input-field" />
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

            {/* Media Uploads (Same as Rent) */}
            <div className="form-group">
                <label>Property Photos/Videos</label>
                <input type="file" multiple accept="image/*,video/*" onChange={(e) => handleFileSelect(e, 'images')} />
                <div className="media-preview-container">
                    {stagedImages.map((item) => (
                        <div key={item.id} className="media-item">
                            {item.file.type.startsWith('image/') ? (
                                <img src={item.preview} alt="Preview" className="media-thumbnail" />
                            ) : (
                                <div className="media-thumbnail video-placeholder">📹 Video</div>
                            )}
                            <button type="button" className="remove-media-btn" onClick={() => removeStagedFile(item.id, 'images')}>✕</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>Documents (PDF/Blueprints/Brochure)</label>
                <input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'docs')} />
                <div className="doc-list-container">
                    {stagedDocs.map((item) => (
                        <div key={item.id} className="doc-item">
                            <span>📄 {item.name}</span>
                            <button type="button" className="remove-media-btn" onClick={() => removeStagedFile(item.id, 'docs')}>✕</button>
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
                <button type="button" onClick={onSubmit} className="primary-button save-and-continue" disabled={isUploading}>
                    Post Your Property for Sale
                </button>
            </div>
        </div>
    );
};

export default SalePropertyForm;
