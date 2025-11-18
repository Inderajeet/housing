import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuBar.css'; 

// Component for the comparison table shown in the image
const PackageComparison = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '2rem' }}>
        <style>{`
            .comparison-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
            }
            .comparison-table th, .comparison-table td {
                padding: 0.75rem 1rem;
                text-align: center;
                border-bottom: 1px solid #f3f4f6;
                font-size: 0.9rem;
            }
            .comparison-table th {
                font-weight: 600;
                color: #4b5563;
                background-color: #f9fafb;
            }
            .comparison-table .feature {
                text-align: left;
                font-weight: 500;
                color: #1f2937;
            }
            .check-icon {
                color: #10b981; /* Green */
                font-weight: bold;
            }
            .cross-icon {
                color: #ef4444; /* Red */
                font-weight: bold;
            }
            .explore-button {
                background-color: #7c3aed;
                color: white;
                padding: 0.75rem 2rem;
                border-radius: 0.5rem;
                border: none;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.2s;
                margin-top: 1rem;
            }
            .explore-button:hover {
                background-color: #6d28d9;
            }
        `}</style>
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <table className="comparison-table">
                <thead>
                    <tr>
                        <th className="feature">Feature</th>
                        <th style={{ backgroundColor: '#e5e7eb', color: '#4b5563' }}>Free Plan</th>
                        <th style={{ backgroundColor: '#a855f7', color: 'white' }}>Owner Packages</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="feature">Visibility</td>
                        <td>15%</td>
                        <td style={{ fontWeight: 'bold' }}>98%</td>
                    </tr>
                    <tr>
                        <td className="feature">Enquiries</td>
                        <td>Only 3</td>
                        <td style={{ fontWeight: 'bold' }}>Unlimited</td>
                    </tr>
                    <tr>
                        <td className="feature">Listing Expiry</td>
                        <td>15 days</td>
                        <td>60 days</td>
                    </tr>
                    <tr>
                        <td className="feature">Matching Buyers</td>
                        <td>-</td>
                        <td className="check-icon">Yes</td>
                    </tr>
                    <tr>
                        <td className="feature">Relationship Manager</td>
                        <td>-</td>
                        <td className="check-icon">Yes</td>
                    </tr>
                    <tr>
                        <td className="feature">Field Visit Assistance</td>
                        <td>-</td>
                        <td className="check-icon">Yes</td>
                    </tr>
                    <tr>
                        <td className="feature">Photoshoot</td>
                        <td>-</td>
                        <td className="check-icon">Yes</td>
                    </tr>
                </tbody>
            </table>
            <button className="explore-button">Explore</button>
        </div>
    </div>
);

// Component for the sidebar boxes (Verify Identity, Attention, Pro Tip, etc.)
const SidebarCard = ({ title, children, color = '#7c3aed' }) => (
    <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', marginBottom: '1.5rem', borderLeft: `4px solid ${color}` }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>{title}</h3>
        <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>{children}</div>
    </div>
);

const SellerDashboard = ({ user }) => {
    return (
        <div className="page-container" style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* --- LEFT COLUMN: Main Content --- */}
                <div className="main-content">
                    <header style={{ marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                            Hi {user.username || 'Seller'}, welcome to your dashboard
                        </h1>
                    </header>

                    {/* Banner section (Post your property) */}
                    <div style={{ backgroundColor: '#f3e8ff', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: '500', color: '#6d28d9' }}>
                            Post your property & find **tenants/buyers faster!**
                            <br />
                            <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#9333ea' }}>List your property for Free & connect with Genuine Seekers</span>
                        </p>
                        <button style={{ backgroundColor: '#9333ea', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                            Post property
                        </button>
                    </div>

                    {/* Owner Packages Section (Matching the image) */}
                    <div style={{ backgroundColor: '#f3e8ff', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '40%', minWidth: '250px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4c1d95', marginBottom: '0.5rem' }}>
                                Get upto 10x more leads with Owner packages
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: '#6d28d9' }}>Try Housing packages now</p>
                            {/*  Placeholder for the graphic */}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                            <PackageComparison />
                        </div>
                    </div>

                    {/* Testimonials (Placeholder section from image) */}
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4b5563', textAlign: 'center', margin: '2rem 0' }}>Testimonials</h2>
                    {/* Placeholder for testimonial cards and arrows */}
                    <div style={{ height: '200px', backgroundColor: '#e5e7eb', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         Testimonial Slider Placeholder
                    </div>

                    {/* FAQ & Support (Placeholder section from image) */}
                    <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Have Questions?</h3>
                            <button style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #9333ea', fontWeight: '500' }}>
                                Explore FAQ's
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Sidebar --- */}
                <div className="sidebar">
                    {/* Not sure which package is best for you? */}
                    <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', marginBottom: '1.5rem', borderTop: '4px solid #a855f7' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>Not sure which Package is best for you?</h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0.5rem 0 1rem' }}>Let us help you out with our interactive plan finder</p>
                        <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500' }}>Find My Plan {'>'}</Link>
                    </div>

                    {/* Verify Identity Card */}
                    <SidebarCard title="Verify your identity" color="#10b981">
                        Complete verification with Aadhar eKYC!
                        <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>Verify Now {'>'}</Link>
                    </SidebarCard>

                    {/* Attention Card */}
                    <SidebarCard title="Attention!" color="#ef4444">
                        Beware of fraudsters asking you to scan QR code for receiving payments.
                        <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>Know More {'>'}</Link>
                    </SidebarCard>
                    
                    {/* Pro Tip Card */}
                    <SidebarCard title="Pro tip:" color="#f59e0b">
                        Be cautious of any suspicious calls received from users posing as 'Armyman' or from other 'public service' and asking to transfer money!
                        <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>Know More {'>'}</Link>
                    </SidebarCard>

                    {/* Property Value Calculator */}
                    <SidebarCard title="Property Value Calculator" color="#7c3aed">
                        Calculate the right value of your property.
                        <Link to="#" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: '500', display: 'block', marginTop: '0.5rem' }}>Estimate Price {'>'}</Link>
                    </SidebarCard>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;