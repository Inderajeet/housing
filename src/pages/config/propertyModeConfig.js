export const PROPERTY_MODE = {
  RENT: 'Rent',
  SALE: 'Sale',
};

export const propertyModeConfig = {
  Rent: {
    apiKey: 'rent',
    priceField: 'rent_amount',
    priceLabel: 'Rent',
    priceSuffix: '/month',
    extraFields: ['advance_amount'],
    bookingFlowJson: '/data/bookingFlowRent.json',
  },

  Sale: {
    apiKey: 'sale',
    priceField: 'sale_price', // OR price
    priceLabel: 'Price',
    priceSuffix: '',
    extraFields: ['survey_number', 'boundary_east'],
    bookingFlowJson: '/data/bookingFlowSale.json',
  },
};
