import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import BrowseItems from './pages/BrowseItems';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ItemDetail from './pages/ItemDetail';
import AddItem from './pages/AddItem';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setError('Missing environment variables. Please check your Supabase configuration.');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-2xl font-bold mb-4">Configuration Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <div className="text-sm text-gray-500">
            Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowseItems />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/add-item" element={user ? <AddItem /> : <Navigate to="/login" />} />
        <Route path="/admin" element={profile?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;