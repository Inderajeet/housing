import axios from 'axios';

// const BASE_URL = 'http://localhost:5000/api/frontend';
const BASE_URL = 'https://housing-backend.vercel.app/api/frontend';

export const apiClient = axios.create({ baseURL: BASE_URL });

export const endpoints = {
  getDistricts: () => apiClient.get('/locations/districts'),
  getTaluks: (districtId) => apiClient.get(`/locations/taluks/${districtId}`),
  getVillages: (talukId) => apiClient.get(`/locations/villages/${talukId}`),
  getProperties: (mode, type = null) => {
    if (mode.toLowerCase() === 'rent') {
      return type
        ? apiClient.get(`/rent/${type}`) // e.g., 1, 2, 3, commercial
        : apiClient.get('/rent');        // all rent
    }

    // sale flow
    return apiClient.get(`/sale/${type}`);
  },

  createProperty: (mode, data) => apiClient.post(`/${mode.toLowerCase()}`, data),
  updateProperty: (mode, id, data) => apiClient.put(`/${mode.toLowerCase()}/${id}`, data),
  uploadAsset: (propertyId, formData) => apiClient.post(`/property-assets/${propertyId}`, formData),

  // Booking flow
  getBookingFlowByPhone: ({ propertyId, unitType, unitId, phone }) =>
    apiClient.get(`/booking-flow`, {
      params: { propertyId, unitType, unitId, phone }
    }),

  updateBookingStage: (data) =>
    apiClient.post('/booking-stage', data),

  getGeneralBookingFlow: ({ propertyId, unitType, unitId }) =>
    apiClient.get('/booking-general', {
      params: { propertyId, unitType, unitId }
    }),


  getPlotLayout: (propertyId) => apiClient.get(`/plot-units/${propertyId}`)
};
