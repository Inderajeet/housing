import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'; 
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  // </StrictMode>,
)
