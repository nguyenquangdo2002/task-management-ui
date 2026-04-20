import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            window.location.href = '/tasks';
        } catch {
            setError('Sai username hoặc password!');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
            <h2>Đăng nhập</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
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
                    style={{ width: '100%', padding: 10, background: '#1890ff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Đăng nhập
                </button>
            </div>
        </div>
    );
}