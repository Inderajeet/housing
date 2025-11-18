// src/components/TopPicksSlider.jsx
import React, { useState, useEffect } from 'react';
import './TopPicksSlider.css';

const TopPicksSlider = ({ topPicks }) => {
  const [progress, setProgress] = useState(0);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentDeveloperIndex, setCurrentDeveloperIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentDeveloper = topPicks[currentDeveloperIndex];
  const currentProjects = currentDeveloper?.projects || [];
  const currentProject = currentProjects[currentProjectIndex];

  // Auto-rotate projects within the same developer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleProjectChange((currentProjectIndex + 1) % currentProjects.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentProjects.length, currentProjectIndex]);

  // Reset progress and project index when developer changes
  useEffect(() => {
    setCurrentProjectIndex(0);
    setProgress(0);
  }, [currentDeveloperIndex]);

  const handleDeveloperChange = (newIndex) => {
    setCurrentDeveloperIndex(newIndex);
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

  if (!currentDeveloper || !currentProject) {
    return <div>Loading...</div>;
  }

  return (
    <div className="top-picks-container">
      {/* Header */}
      <div className="top-picks-header">
        <h2 className="top-picks-title">Housing's top picks</h2>
        <p className="top-picks-subtitle">Explore top living options with us</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content with Navigation */}
      <div className="top-picks-main">
        {/* Developer Header */}
        <div className="developer-header">
          <h3 className="developer-name">{currentDeveloper.developer}</h3>
          <button className="view-projects-btn">{currentDeveloper.viewProjects}</button>
        </div>

        {/* Navigation Arrows and Content */}
        <div className="slide-container">
          {/* Left Navigation Arrow */}
          <button 
            className="nav-arrow left-arrow"
            onClick={() => handleDeveloperChange((currentDeveloperIndex - 1 + topPicks.length) % topPicks.length)}
            disabled={topPicks.length <= 1}
          >
            ‹
          </button>

          {/* Project Content - 3D Card Style */}
          <div className={`project-card-3d ${isAnimating ? 'fade-out' : 'fade-in'}`}>
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
                <img src={currentProject.image} alt={currentProject.name} />
              </div>
              
              {/* Other Projects Thumbnails */}
              <div className="other-projects">
                {currentProjects.map((project, index) => (
                  <button
                    key={project.id}
                    className={`project-thumbnail ${index === currentProjectIndex ? 'active' : ''}`}
                    onClick={() => handleProjectChange(index)}
                  >
                    <img src={project.image} alt={project.name} />
                    <span className="project-thumbnail-name">{project.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Navigation Arrow */}
          <button 
            className="nav-arrow right-arrow"
            onClick={() => handleDeveloperChange((currentDeveloperIndex + 1) % topPicks.length)}
            disabled={topPicks.length <= 1}
          >
            ›
          </button>
        </div>

        {/* Project Navigation Dots */}
        <div className="project-dots">
          {currentProjects.map((_, index) => (
            <button
              key={index}
              className={`project-dot ${index === currentProjectIndex ? 'active' : ''}`}
              onClick={() => handleProjectChange(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopPicksSlider;