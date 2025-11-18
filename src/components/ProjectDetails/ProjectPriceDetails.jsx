import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';
import { AiFillHome } from 'react-icons/ai';

const ProjectPriceDetails = ({ priceDetails, priceRef }) => {
    if (!priceDetails) return null;

    return (
        <div className="section" ref={priceRef}>
            <h2>💰 Price & Floor Plan</h2>
            <div className="price-plan-grid">
                {Object.entries(priceDetails).map(([bhkType, range]) => (
                    <div key={bhkType} className="price-tile">
                        <AiFillHome size={24} color="#007bff" />
                        <strong>{bhkType}</strong>
                        <span>{range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectPriceDetails;