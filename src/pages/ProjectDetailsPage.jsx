import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FaCodeCompare } from 'react-icons/fa6'; // Icon for Compare
import ProjectOverview from '../components/ProjectDetails/ProjectOverview';
import ProjectAmenities from '../components/ProjectDetails/ProjectAmenities';
import ProjectSpecifications from '../components/ProjectDetails/ProjectSpecifications';
import ProjectPriceDetails from '../components/ProjectDetails/ProjectPriceDetails';
import ProjectMap from '../components/ProjectDetails/ProjectMap'; // New Map Component

import '../styles/ProjectDetailsPage.css';

const ProjectDetailsPage = () => {
    const { id } = useParams(); 
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // 1. Create Refs for scrollable sections
    const overviewRef = useRef(null);
    const priceRef = useRef(null);
    const amenityRef = useRef(null);
    const specsRef = useRef(null); 
    const mapRef = useRef(null); // Ref for the map/around section

    // Map tab names to their corresponding refs
    const tabRefMap = useMemo(() => ({
        overview: overviewRef,
        price: priceRef,
        amenities: amenityRef,
        specs: specsRef,
        map: mapRef, // Changed 'around' to 'map' for the new component
    }), []);

    // --- Data Fetching (Uses the rich data from properties.json) ---
    useEffect(() => {
        const fetchProjectDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch('/data/properties.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for properties.json`);
                }
                const data = await response.json();
                
                const foundProject = data.properties.find(p => p.id === parseInt(id));

                if (foundProject) {
                    setProject(foundProject);
                } else {
                    setError('Project not found');
                }
            } catch (err) {
                console.error("Could not fetch project details:", err);
                setError('Failed to load project details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProjectDetails();
        }
    }, [id]);

    // --- Tab Navigation (Click to Scroll) ---
    const handleTabClick = useCallback((key) => {
        setActiveTab(key);
        const ref = tabRefMap[key];
        if (ref && ref.current) {
            window.scrollTo({
                top: ref.current.offsetTop - 100, 
                behavior: 'smooth'
            });
        }
    }, [tabRefMap]);


    // --- Scrollspy Logic (Scroll to update Tab) ---
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150; 
            let newActiveTab = 'overview';
            
            // Define the order of sections for checking (from bottom-most to top-most)
            const sections = [
                { key: 'specs', ref: specsRef },
                { key: 'amenities', ref: amenityRef },
                { key: 'price', ref: priceRef },
                { key: 'map', ref: mapRef },
                { key: 'overview', ref: overviewRef },
            ];

            for (const section of sections) {
                const element = section.ref.current;
                if (element && element.offsetTop <= scrollPosition) {
                    newActiveTab = section.key;
                    break; 
                }
            }

            if (newActiveTab !== activeTab) {
                setActiveTab(newActiveTab);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeTab]);

    // --- Render Logic ---
    if (loading) return <div className="details-container loading">Loading Project Details...</div>;
    if (error) return <div className="details-container error">{error}</div>;
    if (!project) return null;

    const {
        title,
        district,
        developer,
        images_detail, 
        reraCertified,
        priceDetails,
        amenities,
        specifications
    } = project;

    // Use priceDetails['3 BHK'] or default to base price for display
    const startingPrice = priceDetails ? 
        Object.values(priceDetails)[0] : 
        `₹${(project.price / 10000000).toFixed(2)} Cr`;
    
    // Ensure images_detail has at least three placeholder URLs for rendering
    const detailImages = images_detail && images_detail.length >= 3 ? images_detail : [
        project.image || 'https://via.placeholder.com/800x500?text=Main+View',
        project.image || 'https://via.placeholder.com/400x250?text=Interior+View',
        project.image || 'https://via.placeholder.com/400x250?text=Other+View'
    ];


    return (
        <div className="project-details-page">            
            <div className="detail-header-wrapper">
                <div className="breadcrumbs">Home / {district} / {title}</div>
                <div className="project-title-bar">
                    <h1 className="project-title">{title}</h1>
                    <span className="project-price">{startingPrice} Onwards</span>
                </div>
            </div>

            {/* --- Image Gallery Section --- */}
            <div className="image-gallery">
                <div className="main-image">
                    <img src={detailImages[0]} alt={title} />
                    {reraCertified && <span className="rera-tag">RERA CERTIFIED</span>}
                </div>
                <div className="side-images">
                    <img src={detailImages[1]} alt="Interior View 1" />
                    <img src={detailImages[2]} alt="Interior View 2" />
                    <button className="view-more-photos">+40 More Photos</button>
                </div>
            </div>
            
            {/* --- Main Content and Contact Sidebar --- */}
            <div className="content-sidebar-wrapper">
                
                <div className="main-content">
                    
                    {/* --- TABS (NOW FIXED POSITION) --- */}
                    <div className="tabs-container">
                        <div className="tabs">
                            <button 
                                className={activeTab === 'overview' ? 'active' : ''}
                                onClick={() => handleTabClick('overview')}
                            >
                                Overview/Home
                            </button>
                            <button 
                                className={activeTab === 'map' ? 'active' : ''}
                                onClick={() => handleTabClick('map')}
                            >
                                Map & Nearby
                            </button>
                            <button 
                                className={activeTab === 'price' ? 'active' : ''}
                                onClick={() => handleTabClick('price')}
                            >
                                Price & Floor Plan
                            </button>
                            <button 
                                className={activeTab === 'amenities' ? 'active' : ''}
                                onClick={() => handleTabClick('amenities')}
                            >
                                Amenities
                            </button>
                            <button 
                                className={activeTab === 'specs' ? 'active' : ''}
                                onClick={() => handleTabClick('specs')}
                            >
                                Specifications
                            </button>
                        </div>
                    </div>


                    {/* --- SECTIONS (Calling New Components) --- */}
                    
                    <ProjectOverview project={project} overviewRef={overviewRef} />

                    {/* Combine Explore Neighborhood and Around This Project */}
                    <ProjectMap project={project} aroundRef={mapRef} /> 
                    
                    <ProjectPriceDetails priceDetails={priceDetails} priceRef={priceRef} />

                    <ProjectAmenities amenities={amenities} amenityRef={amenityRef} />

                    <ProjectSpecifications specifications={specifications} specsRef={specsRef} />

                    {/* --- Compare Properties Section --- */}
                    <div className="section compare-section">
                        <h2>Compare Properties</h2>
                        <p>Want to see how this property stacks up against others? Add it to your comparison list.</p>
                        <button className="compare-btn">
                            <FaCodeCompare /> Add to Compare List
                        </button>
                    </div>

                </div>

                {/* 2. Contact Sidebar (Kept here for direct state access/simplicity) */}
                <div className="contact-sidebar">
                    <div className="contact-box">
                        <p className="highlight">You have a fine taste. This property is great!</p>
                        <h3>Contact Seller in</h3>
                        <div className="seller-info">
                            <span>{developer.split(' ')[0]}</span>
                            <strong>{developer}</strong>
                        </div>
                        <form>
                            <input type="text" name="name" placeholder="Please share your contact Name" required />
                            <div className="phone-group">
                                <span className="country-code">+91</span>
                                <input type="tel" name="phone" placeholder="Phone" required />
                            </div>
                            <input type="email" name="email" placeholder="Email" required />
                            <label className="checkbox-container">
                                <input type="checkbox" defaultChecked />
                                I agree to be contacted by Housing and agents via WhatsApp, SMS, phone, email etc
                            </label>
                            <button type="submit" className="contact-btn">Get Contact Details</button>
                        </form>
                    </div>
                    <div className="shortlist-box">
                        <p>Still deciding? Shortlist this property for now & easily come back to it later.</p>
                        <button className="shortlist-btn">
                            <span role="img" aria-label="heart">❤️</span> Shortlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;