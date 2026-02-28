import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Map as MapIcon, CalendarCheck, Image as ImageIcon } from 'lucide-react';

import GalleryMap from '../components/GalleryMap';
import BookingFlow from '../components/BookingFlow';
import '../styles/ProjectDetailsPage.css';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const location = useLocation();

    // 1. DATA SOURCE: Prioritize data passed from PropertyCard
    const [project, setProject] = useState(location.state?.propertyData || null);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [activePanel, setActivePanel] = useState('map');
    const [mapThumbFailed, setMapThumbFailed] = useState(false);
    const [imageThumbFailed, setImageThumbFailed] = useState(false);
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

    useEffect(() => {
        if (!hasImages && activePanel === 'images') {
            setActivePanel('map');
        }
    }, [hasImages, activePanel]);

    const handleImageClick = (index) => {
        setPhotoIndex(index);
        setOpenLightbox(true);
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
    const mapThumbSrc = (
        Number.isFinite(parseFloat(project.latitude)) &&
        Number.isFinite(parseFloat(project.longitude)) &&
        import.meta.env.VITE_GOOGLE_MAPS_API
    )
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${parseFloat(project.latitude)},${parseFloat(project.longitude)}&zoom=15&size=320x180&markers=color:red%7C${parseFloat(project.latitude)},${parseFloat(project.longitude)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API}`
        : '';
    const imageThumbSrc = hasImages ? detailImages[0]?.src : '';

    // Prepare location object with additional details
    const mapLocation = {
        lat: parseFloat(project.latitude),
        lng: parseFloat(project.longitude),
        taluk_name: project.taluk_name,
        village_name: project.village_name
    };

    return (
        <div className="project-details-page new-layout">
            <div className="main-content-flow-wrapper">
                <div className="fullview-tab-layout">
                    <div className="fullview-main-area">
                        <div className={`fullview-panel ${activePanel === 'map' ? 'map-active-panel' : ''}`}>
                            {activePanel === 'map' && (
                                <div className="panel-content map-panel-content">
                                    <GalleryMap
                                        location={mapLocation}
                                        title={displayTitle}
                                        status={propertyStatus}
                                        propertyData={project}  // Pass the full project data here
                                    />
                                </div>
                            )}

                            {activePanel === 'booking' && (
                                <div className="panel-content booking-panel-content">
                                    <BookingFlow
                                        propertyId={id}
                                        projectType={project.property_type?.toLowerCase()}
                                        transactionType={isRent ? 'rent' : 'sale'}
                                        saleType={project.sale_type}
                                        generalStatus={generalStatus}
                                        isBlocked={isBlocked || project.rent_status === 'RENTED' || project.sale_status === 'SOLD'}
                                        onStageUpdate={handleStageUpdate}
                                        onStatusChange={handleStatusChange}
                                    />
                                </div>
                            )}

                            {activePanel === 'images' && hasImages && (
                                <div className="panel-content images-panel-content">
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
                        </div>

                        {/* Property Description Section */}
                        {project.description && (
                            <div className="property-description-section">
                                <h2 className="section-title">About this property</h2>
                                <p className="description-text">{project.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="panel-thumbnails">
                        <button
                            type="button"
                            className={`panel-thumb ${activePanel === 'map' ? 'active' : ''}`}
                            onClick={() => setActivePanel('map')}
                        >
                            <div className="panel-thumb-media">
                                {mapThumbSrc && !mapThumbFailed ? (
                                    <img src={mapThumbSrc} alt="Map preview" onError={() => setMapThumbFailed(true)} />
                                ) : (
                                    <div className="panel-thumb-fallback">
                                        <MapIcon size={16} />
                                    </div>
                                )}
                            </div>
                            <span>Street View</span>
                        </button>
                        <button
                            type="button"
                            className={`panel-thumb ${activePanel === 'booking' ? 'active' : ''}`}
                            onClick={() => setActivePanel('booking')}
                        >
                            <CalendarCheck size={18} />
                            <span>Book Property</span>
                        </button>
                        {hasImages && (
                            <button
                                type="button"
                                className={`panel-thumb ${activePanel === 'images' ? 'active' : ''}`}
                                onClick={() => setActivePanel('images')}
                            >
                                <div className="panel-thumb-media">
                                    {imageThumbSrc && !imageThumbFailed ? (
                                        <img src={imageThumbSrc} alt="Images preview" onError={() => setImageThumbFailed(true)} />
                                    ) : (
                                        <div className="panel-thumb-fallback">
                                            <ImageIcon size={16} />
                                        </div>
                                    )}
                                </div>
                                <span>Images</span>
                            </button>
                        )}
                    </div>

                    {/* Lightbox */}
                    {hasImages && (
                        <Lightbox
                            open={openLightbox}
                            close={() => setOpenLightbox(false)}
                            index={photoIndex}
                            slides={detailImages}
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;
