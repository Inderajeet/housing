// src/pages/ProjectDetailsPage.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FaCodeCompare } from 'react-icons/fa6';

import ProjectOverview from '../components/ProjectDetails/ProjectOverview';
import ProjectAmenities from '../components/ProjectDetails/ProjectAmenities';
import ProjectSpecifications from '../components/ProjectDetails/ProjectSpecifications';
import ProjectPriceDetails from '../components/ProjectDetails/ProjectPriceDetails';
import ProjectMap from '../components/ProjectDetails/ProjectMap';
import GalleryMap from '../components/ProjectDetails/GalleryMap';

import '../styles/ProjectDetailsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housing-backend.vercel.app';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const overviewRef = useRef(null);
  const priceRef = useRef(null);
  const amenityRef = useRef(null);
  const specsRef = useRef(null);
  const mapRef = useRef(null);

  const tabRefMap = useMemo(
    () => ({
      overview: overviewRef,
      price: priceRef,
      amenities: amenityRef,
      specs: specsRef,
      map: mapRef,
    }),
    []
  );

  // --- Fetch project details from backend ---
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/properties`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status} for /api/properties`);
        }

        const data = await res.json(); // array
        const idStr = String(id);

        const found = Array.isArray(data)
          ? data.find((p) => String(p.id) === idStr)
          : null;

        if (!found) {
          setError('Project not found');
          setProject(null);
        } else {
          const mappedProject = mapBackendPropertyToProject(found);
          setProject(mappedProject);
        }
      } catch (err) {
        console.error('Could not fetch project details:', err);
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const handleTabClick = useCallback(
    (key) => {
      setActiveTab(key);
      const ref = tabRefMap[key];
      if (ref && ref.current) {
        window.scrollTo({
          top: ref.current.offsetTop - 100,
          behavior: 'smooth',
        });
      }
    },
    [tabRefMap]
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      let newActiveTab = 'overview';

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

  if (loading) {
    return (
      <div className="details-container loading">
        Loading Project Details...
      </div>
    );
  }

  if (error) {
    return <div className="details-container error">{error}</div>;
  }

  if (!project) return null;

  const {
    title,
    district,
    developer,
    images_detail,
    reraCertified,
    priceDetails,
    amenities,
    specifications,
    price,
    image,
    location,
  } = project;

  const startingPrice = computeStartingPrice(price, priceDetails);

  const detailImages =
    images_detail && images_detail.length >= 2
      ? images_detail
      : [
        image || 'https://via.placeholder.com/400x250?text=Interior+View+1',
        image || 'https://via.placeholder.com/400x250?text=Interior+View+2',
      ];

  const hasMapLocation =
    location &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number';

  const safeDeveloper = developer || 'Owner';
  const devFirstName = safeDeveloper.split(' ')[0];

  return (
    <div className="project-details-page">
      <div className="detail-header-wrapper">
        <div className="breadcrumbs">
          Home / {district || 'Location'} / {title}
        </div>
        <div className="project-title-bar">
          <h1 className="project-title">{title}</h1>
          <span className="project-price">{startingPrice} Onwards</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="image-gallery">
        <div className="main-image">
          {hasMapLocation ? (
            <GalleryMap location={location} title={title} />
          ) : (
            <img
              src={
                detailImages[0] ||
                'https://via.placeholder.com/800x500?text=Main+View'
              }
              alt={title}
            />
          )}
          {reraCertified && <span className="rera-tag">RERA CERTIFIED</span>}
        </div>

        <div className="side-images">
          <img src={detailImages[0]} alt="Interior View 1" />
          <img src={detailImages[1]} alt="Interior View 2" />
          <button className="view-more-photos">+ More Photos</button>
        </div>
      </div>

      <div className="content-sidebar-wrapper">
        <div className="main-content">
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

          <ProjectOverview project={project} overviewRef={overviewRef} />

          <ProjectMap project={project} aroundRef={mapRef} />

          <ProjectPriceDetails
            priceDetails={priceDetails}
            priceRef={priceRef}
            // if you want, you can also pass base price, bhk etc:
            basePrice={price}
            bhk={project.bhk}
            area={project.area}
          />

          <ProjectAmenities amenities={amenities} amenityRef={amenityRef} />

          <ProjectSpecifications
            specifications={specifications}
            specsRef={specsRef}
          />

          <div className="section compare-section">
            <h2>Compare Properties</h2>
            <p>
              Want to see how this property stacks up against others? Add it to
              your comparison list.
            </p>
            <button className="compare-btn">
              <FaCodeCompare /> Add to Compare List
            </button>
          </div>
        </div>

        <div className="contact-sidebar">
          <div className="contact-box">
            <p className="highlight">
              You have a fine taste. This property is great!
            </p>
            <h3>Contact Seller in</h3>
            <div className="seller-info">
              <span>{devFirstName}</span>
              <strong>{safeDeveloper}</strong>
            </div>
            <form>
              <input
                type="text"
                name="name"
                placeholder="Please share your contact Name"
                required
              />
              <div className="phone-group">
                <span className="country-code">+91</span>
                <input type="tel" name="phone" placeholder="Phone" required />
              </div>
              <input type="email" name="email" placeholder="Email" required />
              <label className="checkbox-container">
                <input type="checkbox" defaultChecked />
                I agree to be contacted via WhatsApp, SMS, phone, email etc
              </label>
              <button type="submit" className="contact-btn">
                Get Contact Details
              </button>
            </form>
          </div>
          <div className="shortlist-box">
            <p>
              Still deciding? Shortlist this property for now & easily come back
              to it later.
            </p>
            <button className="shortlist-btn">
              <span role="img" aria-label="heart">
                ❤️
              </span>{' '}
              Shortlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to display price nicely (supports rent + sale)
function computeStartingPrice(price, priceDetails) {
  if (priceDetails && Object.keys(priceDetails).length > 0) {
    return Object.values(priceDetails)[0];
  }

  const num = Number(price);
  if (!Number.isFinite(num) || num <= 0) {
    return 'Price on request';
  }

  // If it's a big sale price
  if (num >= 10000000) {
    // 1 Cr and above
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }

  if (num >= 100000) {
    // 1 Lakh and above
    return `₹${(num / 100000).toFixed(2)} L`;
  }

  // Likely rent or small amount
  return `₹${num.toLocaleString('en-IN')}`;
}

// Map backend property (already rich) to the shape this page expects
function mapBackendPropertyToProject(p) {
  return {
    id: p.id,
    title: p.title,
    bhk: p.bhk,
    area: p.area,
    district: p.district,
    taluk: p.taluk,
    village: p.village,
    type: p.type,
    price: p.price,
    location: p.location,
    status: p.status,
    furnish: p.furnish,
    image: p.image,

    developer: p.developer || 'Owner',
    reraCertified: p.reraCertified ?? false,
    possession: p.possession || p.status,

    priceDetails: p.priceDetails || {},
    overview: p.overview || '',
    amenities: p.amenities || [],
    specifications: p.specifications || {},
    images_detail: p.images_detail || [],
    around: p.around || [],
  };
}

export default ProjectDetailsPage;
