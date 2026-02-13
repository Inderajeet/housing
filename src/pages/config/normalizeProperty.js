export const normalizeProperty = (raw, mode) => {
  if (mode === 'Rent') {
    return {
      id: raw.property_id,
      title: raw.formatted_id,
      bhk: raw.bhk,
      price: raw.rent_amount,
      advance: raw.advance_amount,
      type: raw.property_use,
      images: raw.images || [],
      district: raw.district_name,
      latitude: raw.latitude,
      longitude: raw.longitude,
      seller: raw.seller_name || raw.posted_by,
      mode: 'Rent',
      raw,
    };
  }

  // SALE
  return {
    id: raw.property_id,
    title: raw.formatted_id,
    bhk: raw.bhk,
    price: raw.sale_price || raw.price,
    advance: null,
    type: raw.sale_type,
    images: raw.images || [],
    district: raw.district_name,
    latitude: raw.latitude,
    longitude: raw.longitude,
    seller: raw.seller_name,
    mode: 'Sale',
    plotDetails: {
      survey: raw.survey_number,
      boundaries: {
        east: raw.boundary_east,
        west: raw.boundary_west,
      },
    },
    raw,
  };
};
