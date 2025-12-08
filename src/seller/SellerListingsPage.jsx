// src/seller/SellerListingsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/MenuBar.css';
import './styles/SellerStyles.css';
import './styles/ListingsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SidebarCard = ({ title, children, color = '#7c3aed' }) => (
  <div className="sidebar-card" style={{ borderLeft: `4px solid ${color}` }}>
    <h3
      style={{
        fontSize: '1.125rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '0.75rem',
      }}
    >
      {title}
    </h3>
    <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>{children}</div>
  </div>
);

// Single listing card – now driven from property object
const ListingCard = ({ status = 'active', details, onReactivate, onEdit }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  let statusText;
  let statusColor;

  if (status === 'deleted') {
    statusText = 'DELETED';
    statusColor = '#ef4444';
  } else if (status === 'under review') {
    statusText = 'UNDER REVIEW';
    statusColor = '#f97316';
  } else {
    statusText = 'ACTIVE';
    statusColor = '#10b981';
  }

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onEdit) onEdit(details.id);
  };

  return (
    <div className="listing-card">
      <div className="listing-card-header">
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          ID: {details.id || '--'}
        </span>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <span style={{ color: statusColor, fontWeight: '600' }}>
            {statusText}
          </span>

          {/* 3-dot menu trigger */}
          <span
            style={{
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px 6px',
              borderRadius: '4px',
            }}
            onClick={toggleMenu}
          >
            ...
          </span>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.35rem',
                backgroundColor: 'white',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                borderRadius: '0.5rem',
                minWidth: '140px',
                zIndex: 1000,
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#111827',
                }}
                onClick={handleEditClick}
              >
                ✏️ Edit listing
              </button>
              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#ef4444',
                }}
                onClick={() => {
                  setMenuOpen(false);
                  alert('Coming soon: delete / mark as sold');
                }}
              >
                🗑️ Remove / Mark as sold
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <div
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {details.image ? (
            <img
              src={details.image}
              alt={details.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              No Image
            </span>
          )}
        </div>

        <div style={{ flexGrow: 1 }}>
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.25rem',
            }}
          >
            ₹{details.price}
          </h3>
          <p
            style={{
              fontWeight: '500',
              color: '#4c1d95',
              marginBottom: '0.5rem',
            }}
          >
            {details.title}
          </p>

          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            {details.bhkLabel} | {details.sqft} sq. ft. |{' '}
            {details.furnished || 'Unfurnished'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '1rem',
              fontSize: '0.85rem',
            }}
          >
            <p>
              Last Updated:{' '}
              <span style={{ fontWeight: '600' }}>
                {details.lastAdded || '--'}
              </span>
            </p>
            <p>
              Visibility:{' '}
              <span
                style={{
                  fontWeight: '600',
                  color:
                    details.visibility === 'Low' ? '#ef4444' : '#10b981',
                }}
              >
                {details.visibility} ({details.plan})
              </span>
            </p>
          </div>

          {status === 'deleted' && (
            <button
              onClick={onReactivate}
              style={{
                backgroundColor: '#10bb5a',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '1rem',
                transition: 'background-color 0.2s',
              }}
            >
              Reactivate
            </button>
          )}

          {status === 'under review' && (
            <button
              disabled
              style={{
                backgroundColor: '#fcd34d',
                color: '#92400e',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'default',
                marginTop: '1rem',
              }}
            >
              UNDER REVIEW
            </button>
          )}

          {details.listingScore && (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px dashed #e5e7eb',
              }}
            >
              <p style={{ fontWeight: '600', color: '#4b5563' }}>
                Your listing score:{' '}
                <span
                  style={{
                    color:
                      details.visibility === 'Low'
                        ? '#ef4444'
                        : '#f97316',
                  }}
                >
                  {details.listingScore}%
                </span>
              </p>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Improve listing score to sell faster
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                }}
              >
                <span
                  style={{ color: '#9333ea', cursor: 'pointer' }}
                >
                  +15% listing score (Add Photos) {'>'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SellerListingsPage = ({ user }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all properties, then filter by seller
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!user || !user.backendUser) {
          setError('Please log in as a seller to view your listings.');
          setProperties([]);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/properties`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load properties');
        }

        const sellerId = user.backendUser.id;
        const sellerProps = (data || []).filter(
          (p) => Number(p.sellerId) === Number(sellerId)
        );

        setProperties(sellerProps);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalCount = properties.length;

  const rentCount = useMemo(
    () => properties.filter((p) => p.transactionType === 'rent').length,
    [properties]
  );
  const sellCount = useMemo(
    () => properties.filter((p) => p.transactionType === 'sale').length,
    [properties]
  );

  // Filter by category using transactionType from backend
  const filteredProperties = useMemo(() => {
    if (activeCategory === 'All') return properties;
    if (activeCategory === 'Rent') {
      return properties.filter((p) => p.transactionType === 'rent');
    }
    if (activeCategory === 'Sell') {
      return properties.filter((p) => p.transactionType === 'sale');
    }
    return properties;
  }, [properties, activeCategory]);

  const mapPropertyToListingDetails = (p) => {
    const priceStr =
      p.price && p.price > 0
        ? p.price.toLocaleString('en-IN')
        : 'Price on request';

    const lastAdded = p.createdAt
      ? new Date(p.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '';

    return {
      id: p.id,
      title: p.title,
      price: priceStr,
      sqft: p.area || '--',
      bhkLabel: p.bhk || '',
      furnished: p.furnish,
      lastAdded,
      visibility: 'Low', // placeholder
      plan: 'Free Plan', // placeholder
      listingScore: 47,  // placeholder
      image: p.image,
    };
  };

  return (
    <div className="seller-page-container">
      {/* LEFT MAIN CONTENT AREA */}
      <div className="listings-filter-panel">
        {/* Filters side column */}
        <div className="listings-filters">
          <div className="filter-section-title">Show</div>
          <div
            className={`filter-item ${
              activeCategory === 'All' ? 'active' : ''
            }`}
            onClick={() => setActiveCategory('All')}
          >
            All ({totalCount})
          </div>
          <div
            className={`filter-item ${
              activeCategory === 'Rent' ? 'active' : ''
            }`}
            onClick={() => setActiveCategory('Rent')}
          >
            Rent ({rentCount})
          </div>
          <div
            className={`filter-item ${
              activeCategory === 'Sell' ? 'active' : ''
            }`}
            onClick={() => setActiveCategory('Sell')}
          >
            Sell ({sellCount})
          </div>

          <div
            className="filter-section-title"
            style={{ marginTop: '1.5rem' }}
          >
            Status
          </div>
          <div className="filter-item">Active</div>
          <div className="filter-item">Sold / Rented</div>
        </div>

        {/* MAIN LIST CONTENT */}
        <div className="listings-main-content">
          {/* Top bar */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
              Showing {filteredProperties.length} out of {totalCount} properties
            </div>
          </div>

          {loading && (
            <div className="listing-card" style={{ padding: '2rem' }}>
              Loading your listings...
            </div>
          )}

          {!loading && error && (
            <div className="listing-card" style={{ padding: '2rem' }}>
              {error}
            </div>
          )}

          {!loading && !error && filteredProperties.length === 0 && (
            <div className="listing-card" style={{ padding: '3rem' }}>
              <p
                style={{
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                No listings found for this filter.
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredProperties.map((p) => (
              <ListingCard
                key={p.id}
                status="active"
                details={mapPropertyToListingDetails(p)}
                onReactivate={() => {}}
                onEdit={() => {
                  navigate(`/seller/add-property?edit=${p.id}`);
                }}
              />
            ))}

          {/* Visibility box */}
          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                width: '90%',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{ color: '#4b5563', fontWeight: 'bold' }}
                >
                  Free Listing: Low visibility to buyers
                </span>
                <span
                  style={{ color: '#9333ea', fontWeight: 'bold' }}
                >
                  Paid Listing: High visibility to buyers
                </span>
              </div>
              <button
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 2.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  marginBottom: '0.5rem',
                }}
              >
                UPGRADE NOW
              </button>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#7c3aed',
                  cursor: 'pointer',
                }}
              >
                How it works?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="seller-sidebar">
        <SidebarCard title="Your property advisor" color="#a855f7">
          Get assistance on selling/renting your property faster
          <Link
            to="#"
            style={{
              color: '#7c3aed',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'block',
              marginTop: '0.5rem',
            }}
          >
            View contact {'>'}
          </Link>
        </SidebarCard>

        <SidebarCard title="Pro tip:" color="#ef4444">
          Be cautious of any suspicious calls received from users posing as
          'Armyman' or from other 'public service' and asking to transfer
          money!
          <Link
            to="#"
            style={{
              color: '#7c3aed',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'block',
              marginTop: '0.5rem',
            }}
          >
            Know More {'>'}
          </Link>
        </SidebarCard>

        <SidebarCard title="Property Value Calculator" color="#7c3aed">
          Calculate the right value of your property.
          <Link
            to="#"
            style={{
              color: '#7c3aed',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'block',
              marginTop: '0.5rem',
            }}
          >
            Estimate Price {'>'}
          </Link>
        </SidebarCard>

        <div className="sidebar-card" style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#1f2937',
            }}
          >
            You can view only 3 enquiries
          </p>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#4b5563',
              marginBottom: '1rem',
            }}
          >
            View more enquiries by getting our owner package now
          </p>
          <button
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.75rem 2.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerListingsPage;
