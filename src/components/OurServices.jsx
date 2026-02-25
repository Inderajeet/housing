import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import "../styles/OurServices.css";

const serviceRows = [
  {
    id: "stage-1",
    services: [
      "Owner contact and document",
      "Help fix rate and verify basics"
    ]
  },
  {
    id: "stage-2",
    services: [
      "Legal opinion, All official copies",
      "Refundable"
    ]
  },
  {
    id: "stage-3",
    services: [
      "Legal support to your deal and money"
    ]
  },
  {
    id: "stage-4",
    services: [
      "Support registration from home (Future)"
    ]
  }
];

const OurServices = () => {
  return (
    <section className="our-services-poster">
      <div className="poster-header">
        <h2 className="poster-main-title">Our Services</h2>
      </div>

      <div className="poster-rows">
        {serviceRows.map((row) => (
          <div key={row.id} className="poster-row">
            <div className="poster-services-list">
              {row.services.map((service) => (
                <div key={service} className="poster-service-item">
                  <FaCheckCircle />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurServices;
