import React, { useState } from 'react';
import '../styles/MenuBar.css'; 

const LoginModal = ({ onClose, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const credentials = {
        'seller': { password: 'seller', role: 'seller' },
        'buyer': { password: 'buyer', role: 'buyer' },
        'guest': { password: 'guest', role: 'buyer' }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        const user = credentials[username];

        if (user && user.password === password) {
            onLogin(user.role, username);
        } else {
            setError('Invalid username or password. Try seller/seller or buyer/buyer.');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>Log In</h2>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: '#6b7280' }}>
                    Use **seller/seller** for Seller, or **buyer/buyer** for Buyer.
                </p>

                <form onSubmit={handleLogin}>
                    <div className="modal-form-group">
                        <label className="modal-form-label">Username</label>
                        <input
                            type="text"
                            className="modal-form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label className="modal-form-label">Password</label>
                        <input
                            type="password"
                            className="modal-form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p className="modal-error">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="modal-submit-btn"
                        style={{marginTop: '1.5rem'}}
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;