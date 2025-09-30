// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx'; 
import Input from '../components/common/Input.jsx'; 
import Button from '../components/common/Button.jsx'; 
import Notification from '../components/common/Notification.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password); 
      navigate('/'); 
    } catch (err) {
      setError(err.message || 'Error desconocido al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Acceso al ERP
        </h2>
        
        {error && <Notification type="error" message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input 
            label="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <Input 
            label="Contraseña" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;