import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Recycle, User, Menu, X, LogOut, Settings, Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors">
              <Recycle className="h-8 w-8" />
              <span className="text-xl font-bold">ReWear</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/browse" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/browse') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              Browse Items
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/add-item" 
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>List Item</span>
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="h-8 w-8 rounded-full" />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                    <span className="text-sm font-medium">{profile?.points || 0} pts</span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{profile?.name}</div>
                        <div className="text-gray-500">{profile?.email}</div>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-emerald-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/browse" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Items
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/add-item" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  List Item
                </Link>
                {profile?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;