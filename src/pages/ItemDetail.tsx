import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, User, MapPin, Calendar, Package, Star, ArrowLeft, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getItem, createSwapRequest, createTransaction, updateProfile, type Item } from '../lib/supabase';

function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    if (!id) return;
    
    setLoading(true);
    const itemData = await getItem(id);
    setItem(itemData);
    setLoading(false);
  };

  const nextImage = () => {
    if (item?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  const handleSwapRequest = async () => {
    if (!user || !item) {
      alert('Please login to make a swap request');
      return;
    }

    if (user.id === item.user_id) {
      alert('You cannot swap with your own item');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await createSwapRequest({
        item_id: item.id,
        requester_id: user.id,
        owner_id: item.user_id,
        message: swapMessage
      });

      if (error) {
        console.error('Error creating swap request:', error);
        alert('Failed to send swap request. Please try again.');
      } else {
        alert('Swap request sent successfully!');
        setShowSwapModal(false);
        setSwapMessage('');
      }
    } catch (error) {
      console.error('Error creating swap request:', error);
      alert('Failed to send swap request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePointsRedeem = async () => {
    if (!user || !profile || !item) {
      alert('Please login to redeem with points');
      return;
    }

    if (user.id === item.user_id) {
      alert('You cannot purchase your own item');
      return;
    }

    if (profile.points < item.points) {
      alert(`You need ${item.points - profile.points} more points to redeem this item`);
      return;
    }

    setSubmitting(true);
    try {
      // Create transaction
      const { error: transactionError } = await createTransaction({
        item_id: item.id,
        buyer_id: user.id,
        seller_id: item.user_id,
        points: item.points,
        type: 'purchase'
      });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        alert('Failed to complete purchase. Please try again.');
        return;
      }

      // Update buyer points
      const { error: buyerError } = await updateProfile(user.id, {
        points: profile.points - item.points
      });

      if (buyerError) {
        console.error('Error updating buyer points:', buyerError);
      }

      // Update seller points
      if (item.user) {
        const { error: sellerError } = await updateProfile(item.user_id, {
          points: item.user.points + item.points
        });

        if (sellerError) {
          console.error('Error updating seller points:', sellerError);
        }
      }

      await refreshProfile();
      alert('Purchase successful! The item will be shipped to you.');
    } catch (error) {
      console.error('Error completing purchase:', error);
      alert('Failed to complete purchase. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or has been removed.</p>
          <Link to="/browse" className="text-emerald-600 hover:text-emerald-700">
            Browse other items
          </Link>
        </div>
      </div>
    );
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Like New': return 'bg-green-100 text-green-800';
      case 'Excellent': return 'bg-blue-100 text-blue-800';
      case 'Good': return 'bg-yellow-100 text-yellow-800';
      case 'Fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/browse"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to browse</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img 
              src={item.images[currentImageIndex] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'} 
              alt={item.title}
              className="w-full h-96 object-cover"
            />
            
            {item.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {item.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {item.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-emerald-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">{item.category?.name}</span>
                <span>Size: {item.size}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                  {item.condition}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Points */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 font-medium">Exchange Value</span>
              <span className="text-2xl font-bold text-emerald-600">{item.points} points</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            {item.status === 'active' && user?.id !== item.user_id ? (
              <>
                <button 
                  onClick={() => setShowSwapModal(true)}
                  disabled={submitting}
                  className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Send Swap Request</span>
                </button>
                <button 
                  onClick={handlePointsRedeem}
                  disabled={submitting || !profile || profile.points < item.points}
                  className="w-full border-2 border-emerald-600 text-emerald-600 py-3 px-6 rounded-lg font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profile && profile.points < item.points 
                    ? `Need ${item.points - profile.points} more points`
                    : `Redeem with ${item.points} Points`
                  }
                </button>
              </>
            ) : item.status !== 'active' ? (
              <button 
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
              >
                No Longer Available
              </button>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-center">This is your own item</p>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Owner</h3>
            <div className="flex items-center space-x-4">
              <img 
                src={item.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'User')}&background=10b981&color=fff`} 
                alt={item.user?.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.user?.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{item.user?.rating || 5.0}</span>
                  </div>
                  <span>•</span>
                  <span>{item.user?.total_swaps || 0} swaps</span>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{item.user?.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(item.user?.created_at || '').getFullYear()}</span>
                  </div>
                </div>
              </div>
              <Link
                to={`/profile/${item.user_id}`}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Swap Request</h3>
            <p className="text-gray-600 mb-4">
              Send a message to {item.user?.name} to request a swap for this item.
            </p>
            <textarea 
              value={swapMessage}
              onChange={(e) => setSwapMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Hi! I'm interested in swapping for your item. I have..."
            />
            <div className="flex space-x-3 mt-4">
              <button 
                onClick={() => setShowSwapModal(false)}
                disabled={submitting}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSwapRequest}
                disabled={submitting}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetail;