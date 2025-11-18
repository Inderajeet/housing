import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuBar.css';
// Import the shared seller styles
import './styles/SellerStyles.css';
// Import the listings-specific styles
import './styles/ListingsPage.css'; 


const SidebarCard = ({ title, children, color = '#7c3aed' }) => (
    <div className="sidebar-card" style={{ borderLeft: `4px solid ${color}` }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>{title}</h3>
        <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>{children}</div>
    </div>
);

// Component to render a single listing card
const ListingCard = ({ status, details, onReactivate }) => {
    
    let statusText;
    let statusColor;

    if (status === 'deleted') {
        statusText = 'DELETED';
        statusColor = '#ef4444'; // Red
    } else if (status === 'under review') {
        statusText = 'UNDER REVIEW';
        statusColor = '#f97316'; // Orange/Amber
    } else {
        statusText = 'ACTIVE';
        statusColor = '#10b981'; // Green
    }


    return (
        <div className="listing-card">
            <div className="listing-card-header">
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: 18782388</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: statusColor, fontWeight: '600' }}>{statusText}</span>
                    <span style={{ cursor: 'pointer', color: '#6b7280' }}>...</span> {/* More options dropdown */}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '100px', height: '100px', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Image Placeholder */}
                                    </div>
                
                <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>₹{details.price}</h3>
                    <p style={{ fontWeight: '500', color: '#4c1d95', marginBottom: '0.5rem' }}>{details.title}</p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>{details.sqft} sq. ft. | {details.furnished}</p>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.85rem' }}>
                        <p>Last Updated: <span style={{ fontWeight: '600' }}>{details.lastAdded}</span></p>
                        <p>Visibility: <span style={{ fontWeight: '600', color: details.visibility === 'Low' ? '#ef4444' : '#10b981' }}>{details.visibility} ({details.plan})</span></p>
                    </div>

                    {/* Action button based on status */}
                    {status === 'deleted' && (
                        <button 
                            onClick={onReactivate}
                            style={{ backgroundColor: '#10bb5a', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', transition: 'background-color 0.2s' }}
                        >
                            Reactivate
                        </button>
                    )}
                    {status === 'under review' && (
                        <button 
                            disabled
                            style={{ backgroundColor: '#fcd34d', color: '#92400e', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'default', marginTop: '1rem' }}
                        >
                            UNDER REVIEW
                        </button>
                    )}
                    
                    {details.listingScore && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px dashed #e5e7eb' }}>
                            <p style={{ fontWeight: '600', color: '#4b5563' }}>Your listing score: <span style={{color: status === 'deleted' ? '#ef4444' : '#f97316'}}>{details.listingScore}%</span> 😐</p>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Improve listing score to sell faster</p>
                            {/* Score improvement progress indicators */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                <span style={{ color: '#9333ea', cursor: 'pointer' }}>+15% listing score (Add Photos) ></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SellerListingsPage = ({ user }) => {
    // Setting default to 'Under Review (1)' to match the non-deleted status requested
    const [activeCategory, setActiveCategory] = useState('Under Review (1)'); 

    const dummyListing = {
        title: '1.5 BHK Penthouse',
        price: '5,555',
        sqft: 456,
        furnished: 'Unfurnished',
        lastAdded: '17 Nov 2025',
        visibility: 'Low',
        plan: 'Free Plan',
        listingScore: 47 
    };
    
    // Determine which status to pass to the ListingCard based on the filter
    const getStatusForCategory = (category) => {
        if (category.includes('Deleted')) return 'deleted';
        if (category.includes('Under Review')) return 'under review';
        return 'active'; 
    }


    return (
        // The container uses the 2-column grid structure (2fr | 1fr) defined in SellerStyles.css
        <div className="seller-page-container">
            
            {/* --- LEFT MAIN CONTENT AREA (2fr) --- */}
            {/* This panel applies the inner grid (1fr | 3fr) for the filters and cards */}
            <div className="listings-filter-panel">
                
                {/* 1. Left Filters (1fr column of the inner grid) */}
                <div className="listings-filters">
                    <div className="filter-section-title">Show</div>
                    <div className="filter-item active">Residential Properties</div>
                    <div className="filter-item">Commercial Properties</div>

                    <div className="filter-section-title" style={{ marginTop: '1.5rem' }}>Sub-Category</div>
                    
                    <div className="filter-item active" style={{ backgroundColor: '#e5e7eb' }}>
                        Rent (1) 
                        <span style={{float: 'right', fontSize: '0.8rem', color: '#6b7280'}}>▾</span>
                    </div>

                    {['All (1)', 'Reported (0)', 'Active (0)', 'Expired (0)', 'Under Review (1)', 'Rejected (0)', 'Deleted (1)', 'Expiring Soon (0)'].map(item => (
                        <div 
                            key={item}
                            className={`filter-item ${activeCategory === item ? 'active' : ''}`}
                            onClick={() => setActiveCategory(item)}
                        >
                            {item}
                        </div>
                    ))}

                    <div className="filter-item" style={{ marginTop: '1.5rem', backgroundColor: '#e5e7eb' }}>
                        PG (0)
                        <span style={{float: 'right', fontSize: '0.8rem', color: '#6b7280'}}>▾</span>
                    </div>
                </div>
                
                {/* 2. Main Listing Content (3fr column of the inner grid) */}
                <div className="listings-main-content">
                    {/* Top Filters/Sorters */}
                    <div style={{ backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>Showing 1 out of 1 properties</div>
                        {['Locality', 'Property Type', 'Verification Status', 'BHK'].map(filter => (
                            <div key={filter} style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                {filter} ▾
                            </div>
                        ))}
                        <button style={{ color: '#9333ea', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>RESET</button>
                    </div>
                    
                    {/* Render Listing Card based on active category */}
                    {activeCategory.includes('Under Review') && (
                         <ListingCard status="under review" details={{...dummyListing, plan: 'Free Plan (10 Jan 2026)', visibility: 'Low', listingScore: 47}} onReactivate={() => alert('Under Review...')} />
                    )}
                    {activeCategory.includes('Deleted') && (
                        <ListingCard status="deleted" details={dummyListing} onReactivate={() => alert('Reactivating Property...')}/>
                    )}
                    {/* Fallback for other categories (e.g., Active) */}
                    {activeCategory.includes('Active') && (
                        <ListingCard status="active" details={{...dummyListing, plan: 'Owner Package', visibility: 'High', listingScore: 92}} />
                    )}
                    {activeCategory !== 'Deleted (1)' && activeCategory !== 'Under Review (1)' && activeCategory !== 'Active (0)' && (
                        <div className="listing-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{fontSize: '1.2rem', fontWeight: '500'}}>No Listings Found in this category.</p>
                        </div>
                    )}

                    {/* Low/High Visibility Slider */}
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', width: '90%', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: '#4b5563', fontWeight: 'bold' }}>Free Listing: Low visibility to buyers</span>
                                <span style={{ color: '#9333ea', fontWeight: 'bold' }}>Paid Listing: High visibility to buyers</span>
                            </div>
                            <button style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 2.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s', marginBottom: '0.5rem' }}>
                                UPGRADE NOW
                            </button>
                            <p style={{ fontSize: '0.8rem', color: '#7c3aed', cursor: 'pointer' }}>How it works?</p>
                            {/* Slider visual element (simplified) */}
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
                                <div style={{ width: '30%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                                <div style={{ width: '40%', height: '8px', backgroundColor: '#a855f7', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: Sidebar (1fr) --- */}
            <div className="seller-sidebar">
                {/* ... Sidebar Cards ... */}
                <SidebarCard title="Your property advisor" color="#a855f7">
                    Get assistance on selling/renting your property faster
                    <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>View contact ></Link>
                </SidebarCard>

                <SidebarCard title="Pro tip:" color="#ef4444">
                    Be cautious of any suspicious calls received from users posing as 'Armyman' or from other 'public service' and asking to transfer money!
                    <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>Know More ></Link>
                </SidebarCard>

                <SidebarCard title="Property Value Calculator" color="#7c3aed">
                    Calculate the right value of your property.
                    <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>Estimate Price ></Link>
                </SidebarCard>

                {/* You can view only 3 enquiries section */}
                <div className="sidebar-card" style={{ textAlign: 'center' }}>
                    <p style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937'}}>You can view only 3 enquiries</p>
                    <p style={{fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem'}}>View more enquiries by getting our owner package now</p>
                    <button 
                        style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 2.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellerListingsPage;