// src/components/ProjectDetails/ProjectPriceDetails.jsx
import React from "react";
import "../../styles/ProjectPriceDetails.css"; // Make sure to create this

const ProjectPriceDetails = ({ priceDetails, priceRef, basePrice, bhk, area }) => {
  
  const formatPrice = (num) => {
    const price = Number(num);
    if (!price || price <= 0) return "Price on request";

    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;

    return `₹${price.toLocaleString("en-IN")}`;
  };

  const hasPriceDetails = priceDetails && Object.keys(priceDetails).length > 0;

  return (
    <div className="section" ref={priceRef}>
      <h2 className="price-title">Price & Floor Plan</h2>

      <div className="price-table-container">
        <table className="price-table">
          <thead>
            <tr>
              <th>BHK</th>
              <th>Area</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {hasPriceDetails ? (
              // -----------------------------------
              // CASE 1: Project with multiple BHK types
              // -----------------------------------
              Object.entries(priceDetails).map(([bhkType, priceRange]) => (
                <tr key={bhkType}>
                  <td>{bhkType}</td>
                  <td>—</td>
                  <td>{priceRange}</td>
                </tr>
              ))
            ) : (
              // -----------------------------------
              // CASE 2: Single standalone property
              // -----------------------------------
              <tr>
                <td>{bhk || "Unit"}</td>
                <td>{area ? `${area} sqft` : "—"}</td>
                <td>{formatPrice(basePrice)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectPriceDetails;
