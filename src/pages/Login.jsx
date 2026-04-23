import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Login() {
    const { login, googleLogin } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        try {
            await login(username, password);
            window.location.href = '/tasks';
        } catch {
            setError('Invalid username or password!');
        }
    };

    <GoogleLogin
        onSuccess={async (credentialResponse) => {
            try {
                await googleLogin(credentialResponse.credential);
                window.location.href = '/tasks';
            } catch {
                setError('Google login failed!');
            }
        }}
        onError={() => setError('Google login failed!')}
    />

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
            />
            <button
                onClick={handleSubmit}
                style={{ width: '100%', padding: 10, background: '#1890ff', color: 'white', border: 'none', cursor: 'pointer', marginBottom: 12 }}
            >
                Login
            </button>

            {/* Divider */}
            <div style={{ textAlign: 'center', color: '#aaa', marginBottom: 12 }}>— or —</div>

            {/* Google Login Button */}
            <button
                onClick={() => handleGoogleLogin()}
                style={{
                    width: '100%', padding: 10, background: 'white', color: '#444',
                    border: '1px solid #ddd', cursor: 'pointer', borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
            >
                <img src="https://www.google.com/favicon.ico" width={18} height={18} />
                Continue with Google
            </button>
        </div>
    );
}