import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Recycle, Shirt, ShoppingBag, Sparkles, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { testDatabaseConnection, checkEnvironmentVariables } from '../lib/testConnection';

const featuredItems = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
    condition: 'Excellent',
    points: 45,
    category: 'Outerwear'
  },
  {
    id: 2,
    title: 'Designer Summer Dress',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
    condition: 'Like New',
    points: 60,
    category: 'Dresses'
  },
  {
    id: 3,
    title: 'Casual Sneakers',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    condition: 'Good',
    points: 35,
    category: 'Shoes'
  },
  {
    id: 4,
    title: 'Wool Winter Coat',
    image: 'https://images.unsplash.com/photo-1544966503-7ad532c3efef?w=400',
    condition: 'Excellent',
    points: 80,
    category: 'Outerwear'
  }
];

const categories = [
  { name: 'Tops', icon: Shirt, count: 1250 },
  { name: 'Dresses', icon: ShoppingBag, count: 890 },
  { name: 'Outerwear', icon: Shirt, count: 650 },
  { name: 'Shoes', icon: ShoppingBag, count: 980 },
  { name: 'Accessories', icon: Sparkles, count: 445 },
  { name: 'Bottoms', icon: Shirt, count: 720 }
];

function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [testingConnection, setTestingConnection] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    console.log('=== DATABASE CONNECTION TEST ===');
    
    // Check environment variables first
    checkEnvironmentVariables();
    
    // Test database connection
    await testDatabaseConnection();
    
    setTestingConnection(false);
    alert('Check the browser console (F12) for detailed connection test results!');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sustainable Fashion
              <span className="text-emerald-600 block">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of fashion lovers who are reducing waste by swapping, sharing, and discovering 
              pre-loved clothing. Every exchange earns you points towards your next favorite piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 group"
              >
                <span>Start Swapping</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#browse" 
                className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Browse Items
              </a>
              <button 
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="border-2 border-gray-400 text-gray-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Database className="h-5 w-5" />
                <span>{testingConnection ? 'Testing...' : 'Test DB Connection'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group hover:scale-105 transition-transform">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p className="text-gray-600">Active Members</p>
            </div>
            <div className="group hover:scale-105 transition-transform">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <Recycle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600">Items Exchanged</p>
            </div>
            <div className="group hover:scale-105 transition-transform">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors">
                <Star className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4.9/5</h3>
              <p className="text-gray-600">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Items</h2>
            <p className="text-lg text-gray-600">Discover amazing pieces from our community</p>
          </div>
          
          <div className="relative">
            <div className="overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredItems.map((item) => (
                  <div key={item.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto group hover:shadow-xl transition-shadow">
                      <div className="relative overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {item.points} pts
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-emerald-600 font-medium">{item.category}</span>
                          <span className="text-sm text-gray-500">{item.condition}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                        <Link 
                          to={`/item/${item.id}`}
                          className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-center block"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          
          <div className="flex justify-center mt-6 space-x-2">
            {featuredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="browse" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find exactly what you're looking for</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <div 
                key={category.name}
                className="text-center group cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                  <category.icon className="h-10 w-10 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} items</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How ReWear Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to sustainable fashion</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">List Your Items</h3>
              <p className="text-gray-600">Upload photos and details of clothing items you no longer wear</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn Points</h3>
              <p className="text-gray-600">Receive points when others swap or purchase your items</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Shop & Swap</h3>
              <p className="text-gray-600">Use your points to get new-to-you items from the community</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Sustainable Fashion Journey?</h2>
          <p className="text-emerald-100 text-lg mb-8">Join thousands of fashion lovers making a positive impact</p>
          <Link 
            to="/register"
            className="bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center space-x-2 group"
          >
            <span>Get Started Today</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;