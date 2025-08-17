import React, { useState } from 'react';

interface AuthProps {
    onLogin: (name: string, password: string) => string | null;
    onSignup: (name: string, password: string) => string | null;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !password.trim()) {
            setError('All fields are required.');
            return;
        };

        let result: string | null = null;
        if (mode === 'login') {
            result = onLogin(name, password);
        } else {
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            result = onSignup(name, password);
        }
        if (result) {
            setError(result);
        }
    };

    const handleModeChange = (newMode: 'login' | 'signup') => {
        setMode(newMode);
        setName('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    }

    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6 matrix-bg matrix-border">
                <div className="text-center mb-6">
                    <h1 className="text-5xl matrix-text animate-pulse">JAM ROOMS</h1>
                </div>
                <div className="flex mb-4 border-b-2 border-[#00FF41]">
                    <button 
                        onClick={() => handleModeChange('login')}
                        className={`flex-1 p-3 text-2xl transition-colors duration-200 ${mode === 'login' ? 'matrix-text bg-[#002200]' : 'text-gray-500 hover:bg-[#001100]'}`}
                    >
                        LOGIN
                    </button>
                    <button 
                        onClick={() => handleModeChange('signup')}
                        className={`flex-1 p-3 text-2xl transition-colors duration-200 ${mode === 'signup' ? 'matrix-text bg-[#002200]' : 'text-gray-500 hover:bg-[#001100]'}`}
                    >
                        SIGN UP
                    </button>
                </div>
                
                <h2 className="text-3xl mb-2 matrix-text animate-pulse text-center">{mode === 'login' ? '>> ACCESS SYSTEM <<' : '>> CREATE IDENTITY <<'}</h2>
                <p className="text-lg mb-6 text-center text-gray-400">{mode === 'login' ? 'Enter your credentials.' : 'Choose a unique handle and password.'}</p>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ENTER_YOUR_HANDLE..."
                        className="p-3 matrix-input text-xl text-center"
                        required
                        maxLength={15}
                        autoFocus
                        key={mode} // Re-focus when mode changes
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="PASSWORD..."
                        className="p-3 matrix-input text-xl text-center"
                        required
                    />
                    {mode === 'signup' && (
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="CONFIRM_PASSWORD..."
                            className="p-3 matrix-input text-xl text-center"
                            required
                        />
                    )}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <button type="submit" className="p-3 matrix-button text-xl" disabled={!name.trim() || !password.trim()}>
                        {mode === 'login' ? '>> JACK IN <<' : '>> REGISTER <<'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;