import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Perform logout operation
    logout();
    
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Logging you out...</h1>
        <p className="text-gray-600">Thank you for using our platform. You will be redirected shortly.</p>
      </div>
    </div>
  );
};

export default LogoutPage; 