import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { MapPin, CheckCircle, Info } from 'lucide-react';

import GalleryMap from '../components/GalleryMap';
import BookingFlow from '../components/BookingFlow';
import '../styles/ProjectDetailsPage.css';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// --- Internal Shortlist Button ---
const ShortlistButton = ({ projectId }) => {
    const [isShortlisted, setIsShortlisted] = useState(() => {
        const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
        return list.includes(projectId);
    });

    const handleShortlistToggle = (e) => {
        e.stopPropagation();
        const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
        let newList = isShortlisted ? list.filter(id => id !== projectId) : [...list, projectId];
        localStorage.setItem('shortlist', JSON.stringify(newList));
        setIsShortlisted(!isShortlisted);
    };

    return (
        <button className={`shortlist-icon-btn ${isShortlisted ? 'shortlisted' : ''}`} onClick={handleShortlistToggle}>
            {isShortlisted ? <FaHeart size={20} color="#e91e63" /> : <FaRegHeart size={20} />}
        </button>
    );
};

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const location = useLocation();

    // 1. DATA SOURCE: Prioritize data passed from PropertyCard
    const [project, setProject] = useState(location.state?.propertyData || null);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [loading, setLoading] = useState(!project);
    const [error, setError] = useState(null);

    // 2. BOOKING STATES
    const [generalStatus, setGeneralStatus] = useState({ totalBooked: 0, confirmedCount: 0, isFinalized: false });
    const [isBlocked, setIsBlocked] = useState(false);
    
    // 3. STATUS FOR MAP MARKER - Add state for dynamic status
    const [propertyStatus, setPropertyStatus] = useState(null);

    // Fetch property data if not passed via state
    useEffect(() => {
        if (!project) {
            const fetchProperty = async () => {
                try {
                    setLoading(true);
                    // const response = await endpoints.getPropertyById(id);
                    // setProject(response.data);
                    setError(null);
                } catch (err) {
                    setError('Failed to load property details');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProperty();
        }
    }, [id, project]);

    // Initialize property status from project data
    useEffect(() => {
        if (project) {
            const isRent = !!project.rent_amount;
            const status = isRent ? project.rent_status : project.sale_status;
            setPropertyStatus(status);
        }
    }, [project]);

    // Prepare images for Lightbox
    const images = project?.images || [];
    const slides = images.map(img => ({ src: img.url }));
    const detailImages = slides;
    const hasImages = detailImages.length > 0;

    const handleImageClick = (index) => {
        setPhotoIndex(index);
        setOpenLightbox(true);
    };

    const capitalizeFirst = (value) => {
        if (!value || typeof value !== 'string') return '';
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const formatPrice = (price) => {
        if (!price || isNaN(price)) return 'Price on request';
        const n = Number(price);
        if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
        if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
        return `₹${n.toLocaleString('en-IN')}`;
    };

    // Handle status change from BookingFlow
    const handleStatusChange = (newStatus) => {
        setPropertyStatus(newStatus);
        
        // Also update the project object to keep everything in sync
        if (project) {
            const isRent = !!project.rent_amount;
            if (isRent) {
                setProject(prev => ({ ...prev, rent_status: newStatus }));
            } else {
                setProject(prev => ({ ...prev, sale_status: newStatus }));
            }
        }
        
        // Update isBlocked state
        if (newStatus === 'SOLD' || newStatus === 'RENTED') {
            setIsBlocked(true);
        }
    };

    // Initial Load for Booking Status
    useEffect(() => {
        const mockFetchStatus = () => {
            const MOCK_GENERAL_STATUS_DB = {
                '1': { totalBooked: 5, confirmedCount: 2, isFinalized: false },
                '18782388': { totalBooked: 1, confirmedCount: 1, isFinalized: true },
            };
            const status = MOCK_GENERAL_STATUS_DB[id] || { totalBooked: 0, confirmedCount: 0, isFinalized: false };
            setGeneralStatus(status);
            if (status.isFinalized) setIsBlocked(true);
        };
        mockFetchStatus();
    }, [id]);

    const handleStageUpdate = (stage, phone, message) => {
        console.log("New Stage:", stage);
    };

    if (loading) return <div className="details-container loading">Loading property details...</div>;
    if (error || !project) return <div className="details-container error">Property not found or failed to load.</div>;

    const displayTitle = project.formatted_id || project.title;
    const isRent = !!project.rent_amount;
    const extentLabel = [project.extent_area, project.extent_unit].filter(Boolean).join(' ').trim();
    const useLabel = project.property_use || project.property_type || 'Property';
    const saleTypeLabel = capitalizeFirst(project.sale_type);
    const rentFallback = project.area_size ? `${project.area_size}${extentLabel ? ` ${extentLabel}` : ''}` : useLabel;
    const descriptiveTitle = isRent
        ? (project.bhk ? `${project.bhk} BHK ${useLabel}` : rentFallback)
        : [project.area_size, saleTypeLabel].filter(Boolean).join(' ');

    return (
        <div className="project-details-page new-layout">
            <div className="detail-header-wrapper">
                <div className="breadcrumbs">
                    Home / {project.district_name || 'Property'} / {project.formatted_id || 'Details'}
                </div>

                <div className="project-title-bar">
                    {/* Left: Metadata */}
                    <div className="title-left">
                        <div className="main-title-row">
                            <h1 className="project-title">{descriptiveTitle}</h1>
                            <ShortlistButton projectId={project.property_id} />
                        </div>
                        <div className="subtitle-info">
                            <span className="property-id-tag">{project.formatted_id}</span>
                            <p className="location-subtitle">
                                <MapPin size={16} /> {project.village_name}{project.village_name && project.taluk_name ? ', ' : ''}{project.taluk_name}
                            </p>
                        </div>
                    </div>

                    {/* Right: Pricing info */}
                    <div className="title-right pricing-block">
                        <div className="price-item">
                            <span className="price-label">{isRent ? 'Monthly Rent' : 'Expected Price'}</span>
                            <div className="price-value-container">
                                <span className="project-price">
                                    {isRent ? formatPrice(project.rent_amount) : formatPrice(project.sale_price)}
                                </span>
                                {isRent && <small className="price-period">/month</small>}
                            </div>
                        </div>
                        {isRent && project.advance_amount && (
                            <div className="price-item advance">
                                <span className="price-label">Security Advance</span>
                                <span className="advance-price">{formatPrice(project.advance_amount)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="main-content-flow-wrapper">
                <div className="left-map-gallery-column">
                    {/* Map Integration - Using dynamic propertyStatus */}
                    <div className="map-area">
                        <GalleryMap
                            location={{ 
                                lat: parseFloat(project.latitude), 
                                lng: parseFloat(project.longitude) 
                            }}
                            title={displayTitle}
                            status={propertyStatus} // This will update in real-time
                        />
                    </div>

                    {/* Gallery Section */}
                    {hasImages && (
                        <div className="image-gallery-section">
                            <h2 className="section-title">Property Images</h2>
                            <div className="uniform-photo-grid">
                                {detailImages.map((img, i) => (
                                    <div
                                        key={i}
                                        className="grid-photo-item"
                                        onClick={() => handleImageClick(i)}
                                    >
                                        <img src={img.src} alt={`Property ${i + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lightbox */}
                    {hasImages && (
                        <Lightbox
                            open={openLightbox}
                            close={() => setOpenLightbox(false)}
                            index={photoIndex}
                            slides={detailImages}
                        />
                    )}

                    {/* Property Description Section */}
                    {project.description && (
                        <div className="property-description-section">
                            <h2 className="section-title">About this property</h2>
                            <p className="description-text">{project.description}</p>
                        </div>
                    )}
                </div>

                <div className="right-booking-flow-column">
                    {/* Booking Flow Integration - Added onStatusChange prop */}
                    <BookingFlow
                        propertyId={id}
                        projectType={project.property_type?.toLowerCase()}
                        transactionType={isRent ? 'rent' : 'sale'}
                        saleType={project.sale_type}
                        generalStatus={generalStatus}
                        isBlocked={isBlocked || project.rent_status === 'RENTED' || project.sale_status === 'SOLD'}
                        onStageUpdate={handleStageUpdate}
                        onStatusChange={handleStatusChange} // Add this prop
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;