// src/components/TopPicksSlider.jsx
import React, { useState, useEffect } from 'react';
import './TopPicksSlider.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housing-backend.vercel.app';

const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'Price on request';
  const n = Number(price);

  if (n >= 1_00_00_000) {
    // 1 Cr +
    return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (n >= 1_00_000) {
    // 1 Lakh +
    return `₹${(n / 1_00_000).toFixed(2)} L`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
};

const TopPicksSlider = ({ topPicks: initialTopPicks = [] }) => {
  const [progress, setProgress] = useState(0);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentDeveloperIndex, setCurrentDeveloperIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const [topPicksData, setTopPicksData] = useState(initialTopPicks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch promoted properties from backend
  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_BASE_URL}/api/properties`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Failed to load properties (${res.status})`);
        }

        const properties = Array.isArray(data) ? data : [];

        // 1) Filter promoted properties
        let promoted = properties.filter((p) => p.isPromoted);

        // 2) Fallback: if no promoted, use top few by price / recent
        if (promoted.length === 0) {
          promoted = properties.slice(0, 6);
        }

        // 3) Group by developer
        const groupsMap = new Map();

        promoted.forEach((p) => {
          const developerName = p.developer || 'Featured Seller';
          if (!groupsMap.has(developerName)) {
            groupsMap.set(developerName, []);
          }

          const locationParts = [];
          if (p.village) locationParts.push(p.village);
          if (p.district) locationParts.push(p.district);

          const projectObj = {
            id: p.id,
            name: p.title,
            location: locationParts.join(', ') || p.district || p.city || 'Location',
            price: formatPrice(p.price),
            bhk: p.bhk || '',
            contact: 'Contact now',
            image:
              p.image ||
              (p.images_detail && p.images_detail[0]) ||
              'https://via.placeholder.com/400x250?text=Property',
          };

          groupsMap.get(developerName).push(projectObj);
        });

        const groupedTopPicks = Array.from(groupsMap.entries()).map(
          ([developerName, projects]) => ({
            developer: developerName,
            viewProjects: `View ${projects.length} project${projects.length > 1 ? 's' : ''}`,
            projects,
          })
        );

        // If still empty, fallback to whatever was passed in props
        if (groupedTopPicks.length === 0 && initialTopPicks.length > 0) {
          setTopPicksData(initialTopPicks);
        } else {
          setTopPicksData(groupedTopPicks);
        }

        // Reset indices for new data
        setCurrentDeveloperIndex(0);
        setCurrentProjectIndex(0);
        setProgress(0);
      } catch (err) {
        console.error('Failed to load top picks:', err);
        setError(err.message || 'Failed to load top picks');
        // Fallback: use initialTopPicks if provided
        if (initialTopPicks.length > 0) {
          setTopPicksData(initialTopPicks);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTopPicks();
  }, [initialTopPicks]);

  const developers = topPicksData || [];
  const currentDeveloper = developers[currentDeveloperIndex];
  const currentProjects = currentDeveloper?.projects || [];
  const currentProject = currentProjects[currentProjectIndex];

  // Auto-rotate projects within the same developer
  useEffect(() => {
    if (!currentProjects.length) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          const nextIndex =
            currentProjects.length > 0
              ? (currentProjectIndex + 1) % currentProjects.length
              : 0;
          handleProjectChange(nextIndex);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentProjects.length, currentProjectIndex]);

  // Reset project index and progress when developer changes
  useEffect(() => {
    setCurrentProjectIndex(0);
    setProgress(0);
  }, [currentDeveloperIndex]);

  const handleDeveloperChange = (newIndex) => {
    if (!developers.length) return;
    setCurrentDeveloperIndex((newIndex + developers.length) % developers.length);
  };

  const handleProjectChange = (newIndex) => {
    if (newIndex === currentProjectIndex) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentProjectIndex(newIndex);
      setProgress(0);
      setIsAnimating(false);
    }, 300);
  };

  if (loading && developers.length === 0) {
    return <div className="top-picks-container">Loading top picks...</div>;
  }

  if (error && developers.length === 0) {
    return <div className="top-picks-container">Failed to load top picks.</div>;
  }

  if (!currentDeveloper || !currentProject) {
    return <div className="top-picks-container">No featured properties yet.</div>;
  }

  return (
    <div className="top-picks-container">
      {/* Header */}
      <div className="top-picks-header">
        <h2 className="top-picks-title">Housing&apos;s top picks</h2>
        <p className="top-picks-subtitle">
          Promoted & featured properties from top sellers
        </p>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Main Content with Navigation */}
      <div className="top-picks-main">
        {/* Developer Header */}
        <div className="developer-header">
          <div>
            <h3 className="developer-name">{currentDeveloper.developer}</h3>
            <span
              style={{
                fontSize: '0.8rem',
                color: '#10b981',
                fontWeight: 600,
              }}
            >
              Sponsored
            </span>
          </div>
          <button className="view-projects-btn">
            {currentDeveloper.viewProjects}
          </button>
        </div>

        {/* Navigation Arrows and Content */}
        <div className="slide-container">
          {/* Left Navigation Arrow */}
          <button
            className="nav-arrow left-arrow"
            onClick={() =>
              handleDeveloperChange(
                (currentDeveloperIndex - 1 + developers.length) %
                  developers.length
              )
            }
            disabled={developers.length <= 1}
          >
            ‹
          </button>

          {/* Project Content - 3D Card Style */}
          <div
            className={`project-card-3d ${
              isAnimating ? 'fade-out' : 'fade-in'
            }`}
          >
            {/* Left Side - Text Content */}
            <div className="project-text-content">
              <h4 className="project-name">{currentProject.name}</h4>
              <p className="project-location">{currentProject.location}</p>
              <div className="project-price">{currentProject.price}</div>
              <div className="project-bhk">{currentProject.bhk}</div>
              <button className="contact-btn">{currentProject.contact}</button>
            </div>

            {/* Right Side - Image with Other Projects */}
            <div className="project-visual-content">
              {/* Main Project Image */}
              <div className="main-project-image">
                <img
                  src={currentProject.image}
                  alt={currentProject.name}
                  loading="lazy"
                />
              </div>

              {/* Other Projects Thumbnails */}
              <div className="other-projects">
                {currentProjects.map((project, index) => (
                  <button
                    key={project.id || index}
                    className={`project-thumbnail ${
                      index === currentProjectIndex ? 'active' : ''
                    }`}
                    onClick={() => handleProjectChange(index)}
                  >
                    <img
                      src={project.image}
                      alt={project.name}
                      loading="lazy"
                    />
                    <span className="project-thumbnail-name">
                      {project.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Navigation Arrow */}
          <button
            className="nav-arrow right-arrow"
            onClick={() =>
              handleDeveloperChange(
                (currentDeveloperIndex + 1) % developers.length
              )
            }
            disabled={developers.length <= 1}
          >
            ›
          </button>
        </div>

        {/* Project Navigation Dots */}
        <div className="project-dots">
          {currentProjects.map((_, index) => (
            <button
              key={index}
              className={`project-dot ${
                index === currentProjectIndex ? 'active' : ''
              }`}
              onClick={() => handleProjectChange(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPicksSlider;
