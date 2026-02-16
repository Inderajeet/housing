// BookingFlow.js
import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { ChevronLeft } from 'lucide-react';
import "../styles/BookingFlow.css";
import { endpoints } from '../api/api';
import UnitSelector from './UnitSelector';

const BookingFlow = ({ 
  propertyId, 
  projectType, 
  transactionType, 
  saleType, 
  onStatusChange // Add this prop
}) => {
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generalIndex, setGeneralIndex] = useState(null);
  const [generalStatus, setGeneralStatus] = useState(null);
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingStage, setLoadingStage] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [skipUnitSelection, setSkipUnitSelection] = useState(false);
  const [refreshLayoutKey, setRefreshLayoutKey] = useState(0);

  const normalizedSaleType = (saleType || '').toLowerCase();
  const normalizedTransactionType = (transactionType || '').toLowerCase();
  const resolvedUnitType = selectedUnit
    ? (normalizedSaleType || normalizedTransactionType || 'property')
    : (normalizedTransactionType || 'property');

  const isSalePlotOrFlat =
    transactionType === 'sale' &&
    ['plot', 'flat'].includes((saleType || '').toLowerCase());

  // Load stages JSON
  useEffect(() => {
    const flowFile =
      transactionType === 'sale'
        ? '/data/salebookingFlow.json'
        : transactionType === 'rent'
          ? '/data/rentbookingFlow.json'
          : '/data/bookingFlow.json';

    fetch(flowFile)
      .then(res => res.json())
      .then(data => setSteps(data.stages))
      .catch(err => console.error("Failed to load booking stages", err));
  }, [transactionType]);

  // Reset unit selection when property or sale type changes
  useEffect(() => {
    setSkipUnitSelection(false);
    setSelectedUnit(null);
  }, [propertyId, saleType, transactionType]);

  // Load general flow (overall stage) for selected unit or property
  useEffect(() => {
    const loadGeneralFlow = async () => {
      if (isSalePlotOrFlat && !selectedUnit) return;

      try {
        const unitId = selectedUnit
          ? selectedUnit.plot_unit_id || selectedUnit.flat_unit_id
          : propertyId;

        const res = await endpoints.getGeneralBookingFlow({
          propertyId,
          unitType: resolvedUnitType,
          unitId
        });

        setGeneralIndex(res.data.overallStageIndex ?? -1);
        setGeneralStatus(res.data.overallStatus ?? null);

        // Call onStatusChange when status changes
        if (onStatusChange) {
          const isRent = transactionType === 'rent';
          const status = isRent 
            ? (res.data.overallStatus === 'closed' ? 'RENTED' : 
               res.data.overallStatus === 'token_paid' ? 'BOOKED' :
               res.data.overallStatus === 'booked' ? 'ON_BOOKING' : 'Nil Booking')
            : (res.data.overallStatus === 'closed' ? 'SOLD' :
               res.data.overallStatus === 'token_paid' ? 'BOOKED' :
               res.data.overallStatus === 'booked' ? 'ON_BOOKING' : 'Nil Booking');
          
          onStatusChange(status);
        }

        if (res.data.overallStatus === 'closed') {
          setIsFinalized(true);
          setIsSubmitted(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadGeneralFlow();
  }, [propertyId, selectedUnit, resolvedUnitType, transactionType, onStatusChange]);

  // Check booking stage by phone
  const checkStageByPhone = async () => {
    if (phone.length !== 10) return;
    if (isSalePlotOrFlat && !selectedUnit) return;

    try {
      setLoadingStage(true);

      const unitId = selectedUnit
        ? selectedUnit.plot_unit_id || selectedUnit.flat_unit_id
        : propertyId;

      const res = await endpoints.getBookingFlowByPhone({
        propertyId,
        unitType: resolvedUnitType,
        unitId,
        phone
      });

      if (
        generalStatus &&
        ['token_paid', 'advance_paid', 'closed'].includes(generalStatus) &&
        res.data.status !== generalStatus
      ) {
        alert("Sorry, another buyer has already confirmed this unit.");
        return;
      }

      const lastCompletedIndex = res.data.currentIndex ?? -1;

      let nextIndex;
      if (lastCompletedIndex === -1) {
        nextIndex = 0;
      } else {
        nextIndex = lastCompletedIndex + 1 < steps.length
          ? lastCompletedIndex + 1
          : lastCompletedIndex;
      }

      setCurrentStepIndex(nextIndex);
      setIsSubmitted(true);

      if (res.data.status === 'closed') setIsFinalized(true);
    } catch (err) {
      console.error("Booking check failed", err);
      setIsSubmitted(true);
    } finally {
      setLoadingStage(false);
    }
  };

  // Reload general flow when returning to overview mode
  useEffect(() => {
    if (!isSubmitted && !isSalePlotOrFlat) {
      const reloadGeneralFlow = async () => {
        try {
          const unitId = selectedUnit
            ? selectedUnit.plot_unit_id || selectedUnit.flat_unit_id
            : propertyId;

          const res = await endpoints.getGeneralBookingFlow({
            propertyId,
            unitType: resolvedUnitType,
            unitId
          });

          setGeneralIndex(res.data.overallStageIndex ?? -1);
          setGeneralStatus(res.data.overallStatus ?? null);

          // Call onStatusChange when status changes
          if (onStatusChange) {
            const isRent = transactionType === 'rent';
            const status = isRent 
              ? (res.data.overallStatus === 'closed' ? 'RENTED' : 
                 res.data.overallStatus === 'token_paid' ? 'BOOKED' :
                 res.data.overallStatus === 'booked' ? 'ON_BOOKING' : 'Nil Booking')
              : (res.data.overallStatus === 'closed' ? 'SOLD' :
                 res.data.overallStatus === 'token_paid' ? 'BOOKED' :
                 res.data.overallStatus === 'booked' ? 'ON_BOOKING' : 'Nil Booking');
            
            onStatusChange(status);
          }

          if (res.data.overallStatus === 'closed') {
            setIsFinalized(true);
          }
        } catch (err) {
          console.error(err);
        }
      };

      reloadGeneralFlow();
    }
  }, [isSubmitted, propertyId, selectedUnit, resolvedUnitType, isSalePlotOrFlat, transactionType, onStatusChange]);

  // Move to next stage
  const handleNext = async () => {
    const unitId = selectedUnit
      ? selectedUnit.plot_unit_id || selectedUnit.flat_unit_id
      : propertyId;

    const currentStageId = steps[currentStepIndex].id;
    const nextIndex = currentStepIndex + 1;

    try {
      if (currentStageId === 'VISIT_NEGOTIATE') {
        setModalMsg("Within two weeks, please confirm the property by paying the token amount to proceed.");
      } else if (currentStageId === 'TOKEN_PAYMENT') {
        setModalMsg("Next: Please pay part-advance within 2 weeks to secure registration.");
      } else {
        setModalMsg('');
      }

      await endpoints.updateBookingStage({
        propertyId,
        unitType: resolvedUnitType,
        unitId,
        phone,
        stage: currentStageId
      });

      // Determine new status based on stage
      let newStatus;
      if (currentStageId === 'VISIT_NEGOTIATE') {
        newStatus = 'ON_BOOKING';
      } else if (currentStageId === 'TOKEN_PAYMENT') {
        newStatus = 'BOOKED';
      } else if (currentStageId === 'SALE_DEED') {
        newStatus = transactionType === 'rent' ? 'RENTED' : 'SOLD';
      }

      // Immediately update the status via callback
      if (onStatusChange && newStatus) {
        onStatusChange(newStatus);
      }

      if (nextIndex >= steps.length) {
        setIsSubmitted(false);
      } else {
        setCurrentStepIndex(nextIndex);
        setIsSubmitted(false);
        setSelectedUnit(null);
        setRefreshLayoutKey(prev => prev + 1);
      }

      if (currentStageId === 'VISIT_NEGOTIATE' || currentStageId === 'TOKEN_PAYMENT') {
        setShowReminderModal(true);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        alert("This unit is already booked by another buyer.");
        setSelectedUnit(null);
      } else {
        console.error(err);
      }
    }
  };

  if (!steps.length) return null;

  const currentStep = steps[currentStepIndex];
  let activeIndex = -1;
  if (isSubmitted) {
    activeIndex = currentStepIndex;
  } else if (generalIndex !== null) {
    activeIndex = generalIndex;
  }

  const getPrimaryCtaLabel = () => {
    if (activeIndex === -1) return "Book Property";
    if (activeIndex === 0) return "Pay Token Amount";
    if (activeIndex === 1) return "Pay Advance Amount";
    return "Continue Booking";
  };

  return (
    <div className="booking-flow-container fade-in-up">
      {/* Unit selection for plot/flat */}
      {isSalePlotOrFlat && !selectedUnit && !skipUnitSelection ? (
        <UnitSelector
          key={refreshLayoutKey}
          propertyId={propertyId}
          saleType={saleType}
          onSelectUnit={(unit) => setSelectedUnit(unit)}
          onNoPlots={() => setSkipUnitSelection(true)}
        />
      ) : (
        <>
          {selectedUnit && (
            <div className="selected-unit-header">
              <button
                onClick={() => setSelectedUnit(null)}
                className="back-btn"
              >
                <ChevronLeft size={14} /> Back to Units
              </button>
              <div className="badge">
                Unit: {selectedUnit.formatted_id}
              </div>
            </div>
          )}

          {showReminderModal && (
            <div className="modal-overlay">
              <div className="reminder-modal-compact">
                <FaInfoCircle className="modal-icon-small" />
                <p className="modal-text-small">{modalMsg}</p>
                <button
                  className="mini-saffron-btn"
                  onClick={() => setShowReminderModal(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {!isSubmitted ? (
            <div className="general-overview">
              {!isFinalized && (
                <div className="phone-entry-section">
                  <div className="phone-input-group large-input">
                    <span className="prefix">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      maxLength="10"
                      placeholder="Enter 10-digit number"
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <button
                    className="primary-btn saffron-btn mt-16"
                    disabled={phone.length !== 10 || loadingStage}
                    onClick={checkStageByPhone}
                  >
                    {loadingStage ? "Checking..." : getPrimaryCtaLabel()}
                  </button>
                </div>
              )}

              <h2 className="compact-title">Booking Process</h2>
              <p className="compact-subtitle-light">
                {isFinalized
                  ? transactionType === 'rent' ? "Property Rented" : "Property Sold"
                  : "Secure this property in 4 simple stages"}
              </p>

              <div className="overview-steps-list">
                {steps.map((step, idx) => {
                  const isDone = isFinalized || (activeIndex !== -1 && idx <= activeIndex);
                  return (
                    <div key={step.id} className={`overview-item ${isDone ? 'step-done' : ''}`}>
                      <div className="overview-dot-container">
                        <div className={`overview-dot ${isDone ? 'green-bg' : 'saffron-bg'}`}>
                          {isDone ? <FaCheckCircle size={12} /> : idx + 1}
                        </div>
                        {idx < steps.length - 1 && <div className="overview-connector-line" />}
                      </div>
                      <div className="overview-text">
                        <span className="ot-title-large">{step.title}</span>
                        <span className="ot-subtitle-large">{step.subtitle}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="booking-slide animate-fade">
              <div className="top-nav-row right">
                <button className="nav-btn-link" onClick={() => {
                  setIsSubmitted(false);
                  setRefreshLayoutKey(prev => prev + 1);
                }}>
                  Close
                </button>
              </div>
              <div className="slide-body">
                <h2 className="compact-title">{currentStep.title}</h2>
                <div className="points-list-compact">
                  {currentStep.points.map((p, i) => (
                    <div key={i} className="point-row">
                      <FaCheckCircle className="green-text" />
                      <span className="point-text-light">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="slide-footer-compact">
                <button className="primary-btn green-btn" onClick={handleNext}>
                  {currentStep.nextLabel}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingFlow;
