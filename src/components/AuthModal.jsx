import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    // --- Hardcoded Credentials (Seller/Buyer Split) ---
    const SELLER_USER = 'seller';
    const SELLER_PASS = 'seller';
    const BUYER_USER = 'buyer';
    const BUYER_PASS = 'buyer';
    // -------------------------------------------------

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (username === SELLER_USER && password === SELLER_PASS) {
            onLoginSuccess('seller');
        } else if (username === BUYER_USER && password === BUYER_PASS) {
            onLoginSuccess('buyer');
        } else {
            setError('Invalid credentials. Try seller/seller or buyer/buyer.');
        }
    };

    // Tailwind-like classes for aesthetics (since we are not using full Tailwind here)
    const modalStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
    };
    const contentStyle = {
        backgroundColor: 'white', padding: '30px', borderRadius: '12px',
        width: '90%', maxWidth: '400px', boxShadow: '0 5px 20px rgba(0, 0, 0, 0.4)'
    };
    const inputStyle = {
        width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', 
        borderRadius: '6px', boxSizing: 'border-box'
    };
    const buttonStyle = {
        width: '100%', padding: '12px', marginTop: '15px', 
        backgroundColor: '#6c5ce7', color: 'white', 
        border: 'none', borderRadius: '6px', cursor: 'pointer',
        fontWeight: 'bold'
    };
    const closeButtonStyle = {
        float: 'right', background: 'none', border: 'none', fontSize: '20px', 
        cursor: 'pointer', color: '#888'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                <h2 style={{ marginBottom: '20px', color: '#6c5ce7', textAlign: 'center' }}>Log In / Sign Up</h2>
                
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username (Try: seller or buyer)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password (Try: seller or buyer)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    
                    {error && (
                        <p style={{ color: 'red', fontSize: '12px', textAlign: 'center', margin: '10px 0' }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" style={buttonStyle}>
                        Continue
                    </button>
                    
                    <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '15px' }}>
                        By proceeding, you agree to our Terms and Conditions.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;