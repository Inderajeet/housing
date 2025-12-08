// src/seller/AddPropertyPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Step1_BasicDetails from './components/Step1_BasicDetails';
import Step2_PropertyDetails from './components/Step2_PropertyDetails';
import Step3_PriceDetails from './components/Step3_PriceDetails';
import './styles/AddPropertyStyles.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialFormData = {
  propertyType: 'Residential', // Default to Residential
  lookingTo: '',
  city: 'Select City',

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
  { name: 'Basic Details', statusKey: 'propertyType' },
  { name: 'Property Details', statusKey: 'locality' },
  { name: 'Price Details', statusKey: 'cost' },
];

const AddPropertyPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // 🔍 Load existing property when in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const res = await fetch(`${API_BASE_URL}/api/properties/${editId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load property');
        }

        const p = data; // already mapped by backend

        const propertyType =
          p.type && p.type.toLowerCase().includes('commercial')
            ? 'Commercial'
            : 'Residential';

        // We don't yet expose transaction_type in map, so default:
        const lookingTo =
          p.transactionType === 'rent' || p.transaction_type === 'rent'
            ? 'Rent'
            : 'Sell';

        setFormData({
          propertyType,
          lookingTo,
          city: p.district || p.city || 'Select City',
          locality: p.village || p.locality || '',
          bhk: p.bhk || '',
          builtUpArea: p.area ? Number(p.area) : null,
          areaUnit: 'sq. ft.',
          furnishType: p.furnish || '',
          amenities: p.amenities || [],
          cost: p.price || null,
          constructionStatus: p.status || '',
        });

        // Optionally jump to step 2 or 3 when editing:
        setCurrentStep(1);
      } catch (err) {
        console.error(err);
        setLoadError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [editId, isEditMode]);

  // Step status for left tracker
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  // Universal change handler
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // 🔥 Submit (POST for new, PUT for edit)
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please log in again to post / edit properties.');
        return;
      }

      const payload = {
        // basic mapping
        property_type:
          formData.propertyType === 'Commercial' ? 'commercial' : 'apartment',
        transaction_type:
          formData.lookingTo === 'Rent' ? 'rent' : 'sale',
        city: formData.city,
        locality: formData.locality,
        bhk: formData.bhk
          ? parseInt(formData.bhk) || null
          : null,
        built_up_area: formData.builtUpArea,
        area_unit: formData.areaUnit,
        furnish_type:
          formData.furnishType &&
          formData.furnishType.toLowerCase().replace(/\s+/g, '_'),
        construction_status:
          formData.constructionStatus === 'Under Construction'
            ? 'under_construction'
            : 'ready_to_move',
        price: formData.cost,
        // live_* not changed here – DB keeps existing values on edit
      };

      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode
        ? `${API_BASE_URL}/api/properties/${editId}`
        : `${API_BASE_URL}/api/properties`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save property');
      }

      alert(isEditMode ? 'Property updated successfully!' : 'Property posted successfully!');
      navigate('/seller/listings');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Something went wrong while saving.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (loadError) {
      return (
        <div style={{ padding: '2rem', color: 'red' }}>
          {loadError}
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1_BasicDetails
            data={formData}
            handleChange={handleChange}
            handleNextStep={handleNextStep}
          />
        );
      case 2:
        return (
          <Step2_PropertyDetails
            data={formData}
            handleChange={handleChange}
            handlePrevStep={handlePrevStep}
            handleNextStep={handleNextStep}
          />
        );
      case 3:
        return (
          <Step3_PriceDetails
            data={formData}
            handleChange={handleChange}
            handlePrevStep={handlePrevStep}
            handleSubmit={handleSubmit}
            loading={loading}
            isEditMode={isEditMode}
          />
        );
      default:
        return <p>Step not found.</p>;
    }
  };

  const progress = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="add-property-container">
      {/* LEFT tracker */}
      <div className="property-post-tracker">
        <Link
          to="/seller/listings"
          style={{
            color: '#4c1d95',
            textDecoration: 'none',
            fontWeight: '500',
            display: 'block',
            marginBottom: '2rem',
          }}
        >
          &lt; Return to listings
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
            {isEditMode ? 'Edit your property' : 'Post your property'}
          </h3>
          <span
            style={{ fontSize: '0.8rem', color: '#6b7280' }}
          >
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
                <p className="tracker-status-text">
                  {step.name}
                </p>
                <p
                  style={{
                    color:
                      status === 'active'
                        ? '#9333ea'
                        : '#9ca3af',
                    fontWeight:
                      status === 'active' ? '600' : 'normal',
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
          <p
            style={{
              fontSize: '0.85rem',
              color: '#4b5563',
            }}
          >
            Now you can directly post property via 💬 WhatsApp {'>'}
          </p>
        </div>
      </div>

      {/* RIGHT form content */}
      <div className="property-form-content">
        {loading && !isEditMode && currentStep === 1 ? (
          <div style={{ padding: '2rem' }}>Loading...</div>
        ) : (
          renderStepContent()
        )}
      </div>
    </div>
  );
};

export default AddPropertyPage;
