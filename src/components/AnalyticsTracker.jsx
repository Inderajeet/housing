import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const MEASUREMENT_ID = 'G-P0WNGQF9ZC';

let isInitialized = false;

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      ReactGA.initialize(MEASUREMENT_ID);
      isInitialized = true;
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    ReactGA.send({
      hitType: 'pageview',
      page: `${location.pathname}${location.search}`,
      title: document.title,
    });
  }, [location]);

  return null;
};

export default AnalyticsTracker;
