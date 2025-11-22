// src/seller/components/Step1_BasicDetails.jsx
import React from 'react';

const Step1_BasicDetails = ({ data, handleChange, handleNextStep }) => {
  const cities = ['Select City', 'Chennai', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad'];

  const isStepValid =
    data.propertyType &&
    data.lookingTo &&
    data.city !== 'Select City' &&
    data.ownerName &&
    data.ownerName.trim().length > 0;

  return (
    <div style={{ height: '100%' }}>
      <h2 className="form-title">Post your property</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Sell or rent your property
      </p>

      {/* Property Type */}
      <div className="input-field-group">
        <label style={{ fontSize: '1.1rem', fontWeight: '600' }}>Property Type</label>
        <div className="toggle-group">
          <button
            className={`toggle-button ${
              data.propertyType === 'Residential' ? 'active' : ''
            }`}
            onClick={() => handleChange('propertyType', 'Residential')}
          >
            Residential
          </button>
          <button
            className={`toggle-button ${
              data.propertyType === 'Commercial' ? 'active' : ''
            }`}
            onClick={() => handleChange('propertyType', 'Commercial')}
          >
            Commercial
          </button>
        </div>
      </div>

      {/* Looking To */}
      <div className="input-field-group">
        <label
          style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '1rem' }}
        >
          Looking to
        </label>
        <div className="toggle-group">
          <button
            className={`toggle-button ${
              data.lookingTo === 'Rent' ? 'active' : ''
            }`}
            onClick={() => handleChange('lookingTo', 'Rent')}
          >
            Rent
          </button>
          <button
            className={`toggle-button ${
              data.lookingTo === 'Sell' ? 'active' : ''
            }`}
            onClick={() => handleChange('lookingTo', 'Sell')}
          >
            Sell
          </button>
          <button
            className={`toggle-button ${
              data.lookingTo === 'PG/Co-living' ? 'active' : ''
            }`}
            onClick={() => handleChange('lookingTo', 'PG/Co-living')}
          >
            PG/Co-living
          </button>
        </div>
      </div>

      {/* City */}
      <div className="input-field-group">
        <label
          style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '1rem' }}
        >
          City
        </label>
        <select
          className="select-input"
          value={data.city}
          onChange={(e) => handleChange('city', e.target.value)}
        >
          {cities.map((city) => (
            <option
              key={city}
              value={city}
              disabled={city === 'Select City'}
            >
              {city}
            </option>
          ))}
        </select>
        {data.city === 'Select City' && (
          <p className="validation-error">Please select a city</p>
        )}
      </div>

      {/* Your Name */}
      <div className="input-field-group">
        <label
          style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '1rem' }}
          htmlFor="ownerName"
        >
          Your Name
        </label>
        <input
          id="ownerName"
          type="text"
          className="text-input"
          placeholder="Enter your name"
          value={data.ownerName || ''}
          onChange={(e) => handleChange('ownerName', e.target.value)}
        />
        {!data.ownerName && (
          <p className="validation-error">Please enter your name</p>
        )}
      </div>

      {/* Next Button */}
      <div style={{ marginTop: '3rem', textAlign: 'right' }}>
        <button
          style={{
            backgroundColor: isStepValid ? '#059669' : '#a7f3d0',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: 'bold',
            cursor: isStepValid ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
          onClick={isStepValid ? handleNextStep : null}
          disabled={!isStepValid}
        >
          Next, add property details
        </button>
      </div>
    </div>
  );
};

export default Step1_BasicDetails;
