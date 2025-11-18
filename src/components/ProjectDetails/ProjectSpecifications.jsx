import React from 'react';
import { FaBullseye, FaFaucet, FaPaintRoller } from 'react-icons/fa';

const ProjectSpecifications = ({ specifications, specsRef }) => {
    if (!specifications) return null;

    return (
        <div className="section" ref={specsRef}>
            <h2>🏗️ Project Specifications</h2>
            <div className="specs-container">
                <div className="specs-group">
                    <label><FaBullseye /> Floor & Counter</label>
                    <p>{specifications.floor || 'Details not available'}</p>
                </div>
                <div className="specs-group">
                    <label><FaFaucet /> Fittings</label>
                    <p>{specifications.fitting || 'Details not available'}</p>
                </div>
                <div className="specs-group">
                    <label><FaPaintRoller /> Wall & Ceiling</label>
                    <p>{specifications.wall || 'Details not available'}</p>
                </div>
            </div>
        </div>
    );
};

export default ProjectSpecifications;