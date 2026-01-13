// src/pages/ProjectDetailsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // FaDotCircle is now used only in BookingFlow.jsx

import GalleryMap from '../components/ProjectDetails/GalleryMap'; 
import BookingFlow from '../components/BookingFlow'; // 👈 IMPORTED NEW COMPONENT
import '../styles/ProjectDetailsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housing-backend.vercel.app';

// --- BOOKING FLOW DEFINITIONS (Simplified for ProjectDetailsPage) ---
const BOOKING_STAGES = {
    NOT_BOOKED: 'NOT_BOOKED',
    CONTACT_REGISTERED: 'CONTACT_REGISTERED',
    BOOKED: 'BOOKED',
    CONFIRMED: 'CONFIRMED',
    DEAL_FINALISED: 'DEAL_FINALISED',
    DEAL_BLOCKED: 'DEAL_BLOCKED', 
};


// --- Shortlist Button Component (Remains the same) ---
const ShortlistButton = ({ projectId }) => {
    const [isShortlisted, setIsShortlisted] = useState(() => {
        const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
        return list.includes(projectId);
    }); 

    const handleShortlistToggle = () => {
        const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
        let newList;

        if (isShortlisted) {
            newList = list.filter(id => id !== projectId);
        } else {
            newList = [...list, projectId];
        }

        localStorage.setItem('shortlist', JSON.stringify(newList));
        setIsShortlisted(!isShortlisted);
    };

    return (
        <button 
            className={`shortlist-icon-btn ${isShortlisted ? 'shortlisted' : ''}`}
            onClick={handleShortlistToggle}
            title={isShortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
        >
            {isShortlisted ? <FaHeart /> : <FaRegHeart />}
        </button>
    );
};


// --- Helper Functions for Mock DB (Moved to BookingFlow.jsx, but keeping fetchGeneralStatus logic for initial load) ---
const fetchGeneralStatus = async (propertyId) => {
    // Re-implemented here for initial ProjectDetailsPage load
    const MOCK_GENERAL_STATUS_DB = {
        '1': { totalBooked: 5, confirmedCount: 2, isFinalized: false },
        '18782388': { totalBooked: 1, confirmedCount: 1, isFinalized: true }, 
    };
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_GENERAL_STATUS_DB[propertyId] || { totalBooked: 0, confirmedCount: 0, isFinalized: false };
};


// --- ProjectDetailsPage Component ---
const ProjectDetailsPage = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Stage now starts at CONTACT_REGISTERED to match the new component
    const [bookingStage, setBookingStage] = useState(BOOKING_STAGES.CONTACT_REGISTERED); 
    const [isBlocked, setIsBlocked] = useState(false);
    const [generalStatus, setGeneralStatus] = useState({ totalBooked: 0, confirmedCount: 0, isFinalized: false });

    // Effect 1: Initial fetch of General Status
    useEffect(() => {
        if (id) {
            fetchGeneralStatus(id).then(status => {
                setGeneralStatus(status);
                // Set blocked state immediately if general deal is already finalized
                if (status.isFinalized) {
                    setIsBlocked(true);
                }
            });
        }
    }, [id]);
    
    // Effect 2: Fetch project details (Logic remains the same)
    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            
            try {
                const res = await fetch(`${API_BASE_URL}/api/properties`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json(); 
                const idStr = String(id);
                const found = Array.isArray(data)
                    ? data.find((p) => String(p.id) === idStr)
                    : null;
                if (!found) {
                    setError('Project not found');
                    setProject(null);
                } else {
                    const mappedProject = mapBackendPropertyToProject(found);
                    setProject(mappedProject);
                }
            } catch (err) {
                console.error('Could not fetch project details:', err);
                setError('Failed to load project details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);


    // Handler passed to the BookingFlow component
    const handleBookingStageUpdate = (stage, phone, message) => {
        setBookingStage(stage);
        
        // Re-fetch general status to get the most current counts/finalized status
        fetchGeneralStatus(id).then(status => {
            setGeneralStatus(status);
            // Block if the general status is finalized AND the user is NOT the one who just finalized
            setIsBlocked(status.isFinalized && stage !== BOOKING_STAGES.DEAL_FINALISED);
        });
    };

    if (loading) {
        return <div className="details-container loading">Loading Project Details...</div>;
    }
    if (error) {
        return <div className="details-container error">{error}</div>;
    }
    if (!project) return null;

    const {
        id: projectId,
        title,
        district,
        images_detail,
        reraCertified,
        price,
        priceDetails,
        image,
        location,
        lookingTo 
    } = project;

    const isSale = !['Rent', 'PG/Co-living'].includes(lookingTo); 
    const startingPrice = computeStartingPrice(price, priceDetails);
    
    const detailImages =
        images_detail && images_detail.length >= 2
        ? images_detail
        : [
            image || 'https://via.placeholder.com/400x250?text=Interior+View+1',
            image || 'https://via.placeholder.com/400x250?text=Interior+View+2',
            ];

    const hasMapLocation =
        location &&
        typeof location.lat === 'number' &&
        typeof location.lng === 'number';
    
    const isTopSectionReady = hasMapLocation && isSale;


    return (
        <div className="project-details-page new-layout">
            <div className="detail-header-wrapper">
                <div className="breadcrumbs">
                    Home / {district || 'Location'} / {title}
                </div>
                <div className="project-title-bar">
                    <h1 className="project-title">{title}</h1>
                    <span className="project-price">{startingPrice} Onwards</span>
                    <ShortlistButton projectId={projectId} />
                </div>
            </div>

            {/* --- MAIN CONTAINER: TWO COLUMNS (Map/Gallery on Left, Booking on Right) --- */}
            <div className="main-content-flow-wrapper">
                
                {/* --- LEFT COLUMN: MAP & IMAGE GALLERY --- */}
                <div className="left-map-gallery-column">
                    
                    {/* Map/Street View */}
                    {isTopSectionReady && (
                        <div className="map-area">
                            <GalleryMap location={location} title={title} streetView={true} /> 
                            {reraCertified && <span className="rera-tag">RERA CERTIFIED</span>}
                        </div>
                    )}

                    {/* Image Gallery */}
                    <div className="image-gallery-section">
                        <h2>Property Images</h2>
                        <div className="image-gallery">
                            <div className="main-image">
                                <img
                                    src={detailImages[0]}
                                    alt={title}
                                />
                            </div>

                            <div className="side-images">
                                <img src={detailImages[1]} alt="Interior View 1" />
                                <img src={detailImages[2] || detailImages[0]} alt="Interior View 2" />
                                <button className="view-more-photos">+ More Photos</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: BOOKING FLOW (Stretched to fill height) --- */}
                <div className="right-booking-flow-column">
                    
                    <div className="booking-flow-area">
                        {/* 👈 RENDER THE SEPARATE COMPONENT */}
                        <BookingFlow 
                            propertyId={id} 
                            // Note: currentStage is now internally managed by BookingFlow, 
                            // but we pass the initial/updated values.
                            onStageUpdate={handleBookingStageUpdate}
                            isBlocked={isBlocked}
                            generalStatus={generalStatus}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Functions (Same as before) ---
function computeStartingPrice(price, priceDetails) {
    if (priceDetails && Object.keys(priceDetails).length > 0) {
        return Object.values(priceDetails)[0];
    }
    const num = Number(price);
    if (!Number.isFinite(num) || num <= 0) {
        return 'Price on request';
    }
    if (num >= 10000000) {
        return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
        return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
}

function mapBackendPropertyToProject(p) {
    return {
        id: p.id,
        title: p.title,
        district: p.district,
        price: p.price,
        location: p.location,
        image: p.image,
        lookingTo: p.lookingTo,
        developer: p.developer,
        reraCertified: p.reraCertified ?? false,
        priceDetails: p.priceDetails || {},
        images_detail: p.images_detail || [],
    };
}

export default ProjectDetailsPage;