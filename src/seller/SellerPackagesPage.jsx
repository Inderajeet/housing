import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuBar.css';
import './styles/SellerStyles.css'; // Import new seller styles
import './styles/PackagesPage.css'; // Import new seller styles

const checkIcon = <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>;
const crossIcon = <span style={{ color: '#ef4444', fontWeight: 'bold' }}>x</span>;

const packageData = [
    { name: 'Basic', visibility: 75, days: 30, position: 'Medium Slot', popular: false, price: '₹999' },
    { name: 'Premium +', visibility: 86, days: 120, position: 'Medium Slot', popular: true, price: '₹2,499' },
    { name: 'Assist', visibility: 92, days: 120, position: 'Top Slot', popular: false, price: '₹4,999' },
    { name: 'Super Assist', visibility: 98, days: 150, position: 'Top Slot', popular: false, price: '₹7,999' },
];

const featureData = [
    { name: 'Plan Validity', key: 'days', formatter: (val) => `${val} Days` },
    { name: 'Position of your property in search result', key: 'position' },
    { name: 'Relationship Manager Assistance', key: 'manager', formatter: (val, pkg) => (pkg.name === 'Basic' || pkg.name === 'Premium +') ? crossIcon : checkIcon },
    { name: 'Field Visit Assistance', key: 'fieldVisit', formatter: (val, pkg) => pkg.name === 'Basic' ? crossIcon : checkIcon },
    { name: 'Professional Photoshoot of Property', key: 'photoshoot', formatter: (val, pkg) => pkg.name === 'Basic' ? crossIcon : checkIcon },
    { name: 'Assured 1st rank in search results', key: 'rank', formatter: (val, pkg) => pkg.name === 'Assist' ? '3 Boosts' : pkg.name === 'Super Assist' ? '5 Boosts' : crossIcon },
    { name: 'Social media marketing', key: 'social', formatter: (val, pkg) => pkg.name === 'Basic' ? crossIcon : checkIcon },
    { name: 'Shorts', key: 'shorts', formatter: (val, pkg) => pkg.name === 'Basic' ? crossIcon : checkIcon },
    { name: 'Property Report', key: 'report', formatter: (val, pkg) => crossIcon }, // Placeholder based on image showing x for all
];


const SellerPackagesPage = () => {
    const [activeType, setActiveType] = useState('For Sale');

    return (
        <div className="page-container" style={{ fontFamily: 'sans-serif' }}>
            <div className="packages-header">
                <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#4c1d95', marginBottom: '1.5rem' }}>
                    Find the right package for your Residential listing
                </h1>
                
                <div className="packages-nav-tabs">
                    <div className={`package-tab ${activeType === 'For Sale' ? 'active' : ''}`} onClick={() => setActiveType('For Sale')}>For Sale</div>
                    <div className={`package-tab ${activeType === 'For Rent' ? 'active' : ''}`} onClick={() => setActiveType('For Rent')}>For Rent</div>
                    <div className={`package-tab ${activeType === 'For PG' ? 'active' : ''}`} onClick={() => setActiveType('For PG')}>For PG</div>
                </div>
                
                <Link to="#" style={{ color: '#9333ea', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem', display: 'block' }}>Explore Commercial Packages {'>'}</Link>

                {/* Offer Banner */}
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <div style={{ backgroundColor: '#ffc107', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Flat 10% Off</div>
                    <div style={{ backgroundColor: '#ff9800', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>+ Additional discount expiring in 4:55</div>
                </div>

            </div>

            <div className="package-grid-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <table className="package-table">
                    <thead>
                        <tr>
                            <th className="feature-name" style={{ width: '30%', padding: '0 1rem' }}></th>
                            {packageData.map(pkg => (
                                <th key={pkg.name} className={`package-card ${pkg.popular ? 'popular' : ''}`} style={{ verticalAlign: 'top', padding: '0' }}>
                                    {pkg.popular && <span className="popular-tag">MOST POPULAR</span>}
                                    <div style={{ padding: '1.5rem 1rem 0' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937' }}>{pkg.name}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: '0.5rem 0' }}>Listing Visibility</p>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>{pkg.visibility}%</div>
                                    </div>
                                    {/* Pricing Row - Kept separate for visual consistency */}
                                    <div style={{ padding: '0.75rem 0', backgroundColor: '#f3e8ff', borderBottom: '1px solid #d8b4fe' }}>
                                        <span style={{ fontWeight: 'bold', color: '#4c1d95' }}>{pkg.price}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {featureData.map(feature => (
                            <tr key={feature.name}>
                                <td className="feature-name" style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRight: '1px solid #e5e7eb' }}>
                                    {feature.name}
                                </td>
                                {packageData.map(pkg => (
                                    <td key={pkg.name} style={{ backgroundColor: pkg.popular ? '#fcf8ff' : 'white', fontWeight: pkg.popular ? '600' : 'normal' }}>
                                        {feature.formatter ? feature.formatter(pkg[feature.key], pkg) : pkg[feature.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            {packageData.map(pkg => (
                                <td key={pkg.name} style={{ paddingTop: '1.5rem' }}>
                                    <button 
                                        style={{ backgroundColor: '#7c3aed', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                    >
                                        Buy Now
                                    </button>
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default SellerPackagesPage;