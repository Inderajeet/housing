// src/components/LoginModal.jsx
import React, { useState } from 'react';
import '../styles/MenuBar.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginModal = ({ onClose, onLogin, desiredRole = 'buyer' }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const trimmed = phone.trim();
    if (!trimmed || trimmed.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setInfo('OTP sent to your phone. Use 1234 for testing.');
    setStep('otp');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          otp: otp.trim(),
          role: desiredRole, // <-- now comes from props
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      const user = data.user;

      let appRole = 'buyer';
      if (user.is_seller && !user.is_buyer) appRole = 'seller';
      if (user.is_seller && user.is_buyer) appRole = 'both';

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      localStorage.setItem('authUser', JSON.stringify(user));

      // onLogin(role, username, backendUser, token)
      onLogin(appRole, user.phone, user, data.token);

      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h2
          style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937',
          }}
        >
          Log In / Sign Up
        </h2>

        <p
          style={{
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            color: '#6b7280',
          }}
        >
          Continue with your phone number. For now, use OTP <strong>1234</strong> for testing.
        </p>

        {step === 'phone' && (
          <form onSubmit={handleSendOtp}>
            <div className="modal-form-group">
              <label className="modal-form-label">Phone Number</label>
              <input
                type="tel"
                className="modal-form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            {error && <p className="modal-error">{error}</p>}
            {info && <p className="modal-info">{info}</p>}

            <button
              type="submit"
              className="modal-submit-btn"
              style={{ marginTop: '1.5rem' }}
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="modal-form-group">
              <label className="modal-form-label">Phone Number</label>
              <input
                type="tel"
                className="modal-form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">OTP</label>
              <input
                type="text"
                className="modal-form-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP (1234)"
                required
              />
            </div>

            {error && <p className="modal-error">{error}</p>}
            {info && <p className="modal-info">{info}</p>}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem',
              }}
            >
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setInfo('');
                }}
              >
                Change number
              </button>

              <button
                type="submit"
                className="modal-submit-btn"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
