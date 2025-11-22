// src/seller/AddPropertyPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Step0_LiveLocation from './components/Step0_LiveLocation';
import Step1_BasicDetails from './components/Step1_BasicDetails';
import Step2_PropertyDetails from './components/Step2_PropertyDetails';
import Step3_PriceDetails from './components/Step3_PriceDetails';

import './styles/AddPropertyStyles.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housing-backend.vercel.app';

const initialFormData = {
  // Step 0
  liveLatitude: null,
  liveLongitude: null,
  liveImageDataUrl: '',
  detectedAddress: '',

  // Step 1
  propertyType: 'Residential',
  lookingTo: '',
  city: 'Select City',
  ownerName: '',

  // Step 2
  locality: '',
  bhk: '',
  builtUpArea: null,
  areaUnit: 'Select Area Unit',
  furnishType: '',
  amenities: [],

  // Step 3
  cost: null,
  constructionStatus: '',
};

const STEPS = [
  { name: 'Live Location', statusKey: 'liveLatitude' },
  { name: 'Basic Details', statusKey: 'propertyType' },
  { name: 'Property Details', statusKey: 'locality' },
  { name: 'Price Details', statusKey: 'cost' },
];

const AddPropertyPage = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Mapping helpers
  const mapPropertyType = (propertyType) => {
    if (propertyType === 'Commercial') return 'commercial';
    return 'apartment';
  };

  const mapTransactionType = (lookingTo) => {
    if (lookingTo === 'Sell') return 'sale';
    return 'rent';
  };

  const mapFurnishType = (furnishType) => {
    if (furnishType === 'Fully Furnished') return 'fully_furnished';
    if (furnishType === 'Semi Furnished') return 'semi_furnished';
    if (furnishType === 'Unfurnished') return 'unfurnished';
    return null;
  };

  const mapConstructionStatus = (status) => {
    if (status === 'Ready to Move') return 'ready_to_move';
    if (status === 'Under Construction') return 'under_construction';
    return null;
  };

  const parseBhkNumber = (bhkLabel) => {
    if (!bhkLabel) return null;
    if (bhkLabel.includes('RK')) return 1;
    if (bhkLabel.includes('+')) {
      const num = parseInt(bhkLabel);
      return Number.isNaN(num) ? null : num;
    }
    const num = parseInt(bhkLabel);
    return Number.isNaN(num) ? null : num;
  };

  const buildTitle = () => {
    const bhkText = formData.bhk || '';
    const typeText = formData.propertyType || '';
    const locText = formData.locality || formData.city || '';
    if (!bhkText && !typeText && !locText) return 'Property listing';
    return `${bhkText} ${typeText} in ${locText}`.trim();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSubmitError('You must be logged in as a seller to post a property.');
        setSubmitting(false);
        return;
      }

      const payload = {
        title: buildTitle(),
        description: '',

        property_type: mapPropertyType(formData.propertyType),
        transaction_type: mapTransactionType(formData.lookingTo),

        city: formData.city,
        locality: formData.locality,

        bhk: parseBhkNumber(formData.bhk),
        built_up_area: formData.builtUpArea
          ? Number(formData.builtUpArea)
          : null,

        area_unit: formData.areaUnit,
        furnish_type: mapFurnishType(formData.furnishType),
        construction_status: mapConstructionStatus(
          formData.constructionStatus
        ),

        price: formData.cost ? Number(formData.cost) : null,

        amenities: formData.amenities,
        contactName: formData.ownerName,

        live_latitude: formData.liveLatitude,
        live_longitude: formData.liveLongitude,
        live_image_data_url: formData.liveImageDataUrl,
      };

      const res = await fetch(`${API_BASE_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Failed to create property:', data);
        throw new Error(data.error || 'Failed to create property');
      }

      setSubmitSuccess('Property posted successfully!');

      // Reset form
      setFormData(initialFormData);
      setCurrentStep(1);

      // ✅ Redirect to seller listings
      navigate('/seller/listings');
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.message || 'Something went wrong while posting property.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step0_LiveLocation
            data={formData}
            handleChange={handleChange}
            handleNextStep={handleNextStep}
          />
        );
      case 2:
        return (
          <Step1_BasicDetails
            data={formData}
            handleChange={handleChange}
            handleNextStep={handleNextStep}
          />
        );
      case 3:
        return (
          <Step2_PropertyDetails
            data={formData}
            handleChange={handleChange}
            handlePrevStep={handlePrevStep}
            handleNextStep={handleNextStep}
          />
        );
      case 4:
        return (
          <Step3_PriceDetails
            data={formData}
            handleChange={handleChange}
            handlePrevStep={handlePrevStep}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return <p>Step not found.</p>;
    }
  };

  const progress = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="add-property-container">
      {/* Left tracker */}
      <div className="property-post-tracker">
        <Link
          to="/seller"
          style={{
            color: '#4c1d95',
            textDecoration: 'none',
            fontWeight: '500',
            display: 'block',
            marginBottom: '2rem',
          }}
        >
          &lt; Return to dashboard
        </Link>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
            }}
          >
            Post your property
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {progress}%
          </span>
        </div>

        <div
          style={{
            height: '5px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#9333ea',
              borderRadius: '4px',
              transition: 'width 0.5s',
            }}
          ></div>
        </div>

        {STEPS.map((step, index) => {
          const status = getStepStatus(index + 1);
          return (
            <div key={step.name} className={`tracker-item ${status}`}>
              <div
                className="tracker-status-icon"
                style={{
                  backgroundColor:
                    status === 'completed'
                      ? '#10b981'
                      : status === 'active'
                      ? '#9333ea'
                      : '#d1d5db',
                }}
              >
                {status === 'completed' ? '✓' : index + 1}
              </div>
              <div className="tracker-step-info">
                <p className="tracker-status-text">{step.name}</p>
                <p
                  style={{
                    color: status === 'active' ? '#9333ea' : '#9ca3af',
                    fontWeight: status === 'active' ? '600' : 'normal',
                  }}
                >
                  {status === 'completed'
                    ? 'Completed'
                    : status === 'active'
                    ? 'In progress'
                    : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}

        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '1.5rem',
            marginTop: '2.5rem',
          }}
        >
          <p
            style={{
              color: '#9333ea',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}
          >
            Need help?
          </p>
          <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>
            Now you can directly post property via WhatsApp &gt;
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="property-form-content">
        {renderStepContent()}

        {(submitError || submitSuccess) && (
          <div style={{ marginTop: '1.5rem' }}>
            {submitError && (
              <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                {submitError}
              </p>
            )}
            {submitSuccess && (
              <p style={{ color: '#059669', fontSize: '0.9rem' }}>
                {submitSuccess}
              </p>
            )}
          </div>
        )}

        {submitting && (
          <p
            style={{
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              color: '#6b7280',
            }}
          >
            Posting your property…
          </p>
        )}
      </div>
    </div>
  );
};

export default AddPropertyPage;
