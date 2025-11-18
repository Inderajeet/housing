import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuBar.css';
import './styles/SellerStyles.css'; // Import new seller styles

const SellerEnquiriesPage = ({ user }) => {
    const [activeNav, setActiveNav] = useState('All Enquiries');
    const propertyTitle = "1.5 BHK Penthouse in Chennai Port Trust, Chennai";

    // Reusable Sidebar Card components
    const SidebarCard = ({ title, children, color = '#7c3aed' }) => (
        <div className="sidebar-card" style={{ borderLeft: `4px solid ${color}` }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>{title}</h3>
            <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>{children}</div>
        </div>
    );
    
    // Logic for displaying the main content based on the active tab
    const renderMainContent = () => {
        if (activeNav === 'All Enquiries' || activeNav === 'Contacted') {
            return (
                <div className="enquiries-empty-state">
                    <p style={{ fontSize: '1.5rem', color: '#4b5563', marginBottom: '1rem' }}>No Enquiries found</p>
                    <p style={{ color: '#6b7280' }}>Start promoting your property to get leads!</p>
                </div>
            );
        }
        
        if (activeNav === 'Matching Tenants') {
            return (
                <div className="enquiries-empty-state">
                    <div style={{ margin: '2rem 0', height: '100px', backgroundColor: '#f3e8ff', borderRadius: '1rem' }}>
                        {/* Placeholder for 'Get 10 matching tenants instantly' graphic */}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#6d28d9' }}>Get 10 matching tenants instantly</h3>
                    <p style={{ margin: '1rem 0', color: '#4b5563' }}>Get 10 tenants contacts looking for a property like yours instantly for just **₹499**</p>
                    <button style={{ backgroundColor: '#a855f7', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                        Get 10 Matching Tenants
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="seller-page-container" style={{ gridTemplateColumns: '250px 1fr 300px' }}>
            
            {/* --- LEFT COLUMN: Enquiries Navigation --- */}
            <div className="enquiries-left-nav" style={{ gridColumn: '1 / 2', position: 'sticky', top: '90px', height: 'fit-content' }}>
                <div className="enquiries-sidebar-nav">
                    <div 
                        className={`enquiry-nav-item ${activeNav === 'All Enquiries' ? 'active' : ''}`}
                        onClick={() => setActiveNav('All Enquiries')}
                    >
                        All Enquiries (0)
                    </div>
                    <div 
                        className={`enquiry-nav-item ${activeNav === 'Contacted' ? 'active' : ''}`}
                        onClick={() => setActiveNav('Contacted')}
                    >
                        Contacted (0)
                    </div>
                    <div 
                        className={`enquiry-nav-item ${activeNav === 'Matching Tenants' ? 'active' : ''}`}
                        onClick={() => setActiveNav('Matching Tenants')}
                    >
                        Matching Tenants (0)
                    </div>
                </div>
            </div>

            {/* --- MIDDLE COLUMN: Main Enquiries Content --- */}
            <div className="enquiries-main-content">
                <div style={{ backgroundColor: '#f3e8ff', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #d8b4fe' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#6d28d9' }}>Showing 0 Enquiries for:</p>
                    <p style={{ color: '#4c1d95', fontSize: '0.95rem' }}>{propertyTitle}</p>
                </div>

                <div style={{ backgroundColor: '#ede9fe', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#6d28d9' }}>Want to sell faster? Stand out with our owner packages</p>
                    <Link to="/seller/packages" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}>Upgrade Now {'>'}</Link>
                </div>

                {renderMainContent()}
                
                {activeNav !== 'Matching Tenants' && (
                    <div className="sidebar-card" style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#4b5563', marginBottom: '1rem' }}>You can view only 3 enquiries</p>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>View more enquiries by getting our owner package now</p>
                        <button style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                            Continue
                        </button>
                    </div>
                )}
            </div>

            {/* --- RIGHT COLUMN: Sidebar --- */}
            <div className="seller-sidebar" style={{ gridColumn: '3 / 4' }}>
                <SidebarCard title="Your property advisor" color="#a855f7">
                    Get assistance on selling/renting your property faster
                    <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>View contact {'>'}</Link>
                </SidebarCard>

                <SidebarCard title="Pro tip:" color="#ef4444">
                    Be cautious of any suspicious calls received from users posing as 'Armyman' or from other 'public service' and asking to transfer money!
                    <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>Know More {'>'}</Link>
                </SidebarCard>

                <SidebarCard title="Property Value Calculator" color="#7c3aed">
                    Calculate the right value of your property.
                    <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>Estimate Price {'>'}</Link>
                </SidebarCard>
            </div>
        </div>
    );
};

export default SellerEnquiriesPage;